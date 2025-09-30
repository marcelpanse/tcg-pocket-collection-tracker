import * as tf from '@tensorflow/tfjs'

export interface BoundingBox {
  points: number[][]
  confidence: number
  class: string
  label?: number
}

export interface DetectionResult {
  imageIndex: number
  detections: BoundingBox[]
}

class CardDetectorService {
  private static instance: CardDetectorService
  private model: tf.GraphModel | null = null
  private modelLoading: Promise<void> | null = null
  private numClass = 1

  private constructor() {}

  public static getInstance(): CardDetectorService {
    if (!CardDetectorService.instance) {
      CardDetectorService.instance = new CardDetectorService()
    }
    return CardDetectorService.instance
  }

  public async loadModel(modelPath = '/model/model.json'): Promise<void> {
    if (this.model) {
      return
    }

    if (this.modelLoading) {
      return this.modelLoading
    }

    this.modelLoading = new Promise<void>((resolve, reject) => {
      tf.loadGraphModel(modelPath)
        .then((loadedModel) => {
          this.model = loadedModel
          console.log('Model loaded successfully')
          resolve()
        })
        .catch((error) => {
          console.error('Error loading model:', error)
          this.modelLoading = null
          reject(error)
        })
    })

    return this.modelLoading
  }

  public isModelLoaded(): boolean {
    return !!this.model
  }

  private preprocessImage(
    image: HTMLImageElement,
    modelWidth: number,
    modelHeight: number,
  ): {
    input: tf.Tensor
    originalWidth: number
    originalHeight: number
    paddedWidth: number
    paddedHeight: number
  } {
    const originalWidth = image.width
    const originalHeight = image.height
    const maxSize = Math.max(originalWidth, originalHeight)
    const paddedWidth = maxSize
    const paddedHeight = maxSize

    const input = tf.tidy(() => {
      const img = tf.browser.fromPixels(image)

      const imgPadded = img.pad([
        [0, maxSize - originalHeight],
        [0, maxSize - originalWidth],
        [0, 0],
      ])
      return tf.image
        .resizeBilinear(imgPadded as tf.Tensor3D, [modelWidth, modelHeight])
        .div(255.0)
        .expandDims(0)
    })

    return {
      input,
      originalWidth,
      originalHeight,
      paddedWidth,
      paddedHeight,
    }
  }

  private async fileToImage(imageFile: File): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      if (!imageFile.type.startsWith('image/')) {
        return reject(new Error('Invalid file type'))
      }

      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          resolve(img)
        }
        img.onerror = (error) => {
          reject(error)
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(imageFile)
    })
  }

  private async detectSingleImage(image: HTMLImageElement): Promise<BoundingBox[]> {
    if (!this.model) {
      throw new Error('Model not loaded')
    }

    const modelWidth = 640
    const modelHeight = 640
    const scoreThreshold = 0.1
    const iouThreshold = 0.1

    const { input, originalWidth, originalHeight, paddedWidth, paddedHeight } = this.preprocessImage(image, modelWidth, modelHeight)

    try {
      tf.engine().startScope()

      const predictions = this.model.predict(input) as tf.Tensor

      const [boxes, scores, classes] = tf.tidy(() => {
        let transRes: tf.Tensor

        if (predictions.shape.length === 3 && predictions.shape[0] === 1) {
          transRes = predictions.squeeze([0])
        } else {
          transRes = predictions
        }

        const boxesSlice = transRes.slice([0, 0], [4, -1])
        const boxesTransposed = boxesSlice.transpose()
        const x = boxesTransposed.slice([0, 0], [-1, 1])
        const y = boxesTransposed.slice([0, 1], [-1, 1])
        const w = boxesTransposed.slice([0, 2], [-1, 1])
        const h = boxesTransposed.slice([0, 3], [-1, 1])
        const x1 = tf.sub(x, tf.div(w, 2))
        const y1 = tf.sub(y, tf.div(h, 2))
        const x2 = tf.add(x1, w)
        const y2 = tf.add(y1, h)
        const boxes = tf.concat([y1, x1, y2, x2], 1)

        const scoresSlice = transRes.slice([4, 0], [1, -1]).squeeze()
        const classesSlice = transRes.slice([5, 0], [this.numClass, -1])
        const scores = scoresSlice
        const classes = tf.argMax(classesSlice, 0)

        return [boxes, scores, classes]
      })

      const nms = await tf.image.nonMaxSuppressionAsync(boxes as tf.Tensor2D, scores as tf.Tensor1D, 100, iouThreshold, scoreThreshold)

      const detections = tf.tidy(() => tf.concat([boxes.gather(nms, 0), scores.gather(nms, 0).expandDims(1), classes.gather(nms, 0).expandDims(1)], 1))

      const detData = detections.dataSync()
      const numDetections = detections.shape[0]
      const boundingBoxes: BoundingBox[] = []

      const scaleX = originalWidth / paddedWidth
      const scaleY = originalHeight / paddedHeight

      for (let i = 0; i < numDetections; i++) {
        const offset = i * 6
        const y1 = detData[offset]
        const x1 = detData[offset + 1]
        const y2 = detData[offset + 2]
        const x2 = detData[offset + 3]
        const score = detData[offset + 4]
        const label = detData[offset + 5]

        const origX1 = (x1 * originalWidth) / 640 / scaleX
        const origY1 = (y1 * originalHeight) / 640 / scaleY
        const origX2 = (x2 * originalWidth) / 640 / scaleX
        const origY2 = (y2 * originalHeight) / 640 / scaleY

        const points = [
          [origX1, origY1],
          [origX2, origY1],
          [origX2, origY2],
          [origX1, origY2],
        ]

        boundingBoxes.push({
          points,
          confidence: score * 100,
          class: 'pokemon_card',
          label: label,
        })
      }

      return boundingBoxes
    } finally {
      input.dispose()
      tf.engine().endScope()
    }
  }

  public async detectImages(imageFiles: File[]): Promise<DetectionResult[]> {
    if (!this.model) {
      await this.loadModel()
    }

    const results: DetectionResult[] = []

    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const image = await this.fileToImage(imageFiles[i])
        const detections = await this.detectSingleImage(image)

        results.push({
          imageIndex: i,
          detections,
        })
      } catch (error) {
        console.error(`Error detecting objects in image ${i}:`, error)
        results.push({
          imageIndex: i,
          detections: [],
        })
      }
    }

    return results
  }
}

export default CardDetectorService
