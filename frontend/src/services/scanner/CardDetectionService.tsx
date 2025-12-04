import * as tf from '@tensorflow/tfjs'
import { getCardByInternalId } from '@/lib/CardsDB'
import { calculatePerceptualHash, calculateSimilarity, type Hashes, imageToBuffers } from '@/lib/hash'
import type { Card } from '@/types'

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

export interface ExtractedCard {
  matchedCard: {
    card: Card
    similarity: number
  }
  imageUrl: string
  resolvedImageUrl: string
  increment: number
}

const numClass = 1
const modelPath = '/model/model.json'

export async function loadModel() {
  return tf.loadGraphModel(modelPath)
}

async function fileToImage(imageFile: File): Promise<HTMLImageElement> {
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

function preprocessImage(
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

async function detectSingleImage(model: tf.GraphModel, image: HTMLImageElement): Promise<BoundingBox[]> {
  const modelWidth = 640
  const modelHeight = 640
  const scoreThreshold = 0.1
  const iouThreshold = 0.1

  const { input, originalWidth, originalHeight, paddedWidth, paddedHeight } = preprocessImage(image, modelWidth, modelHeight)

  try {
    tf.engine().startScope()

    const predictions = model.predict(input) as tf.Tensor

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
      const classesSlice = transRes.slice([5, 0], [numClass, -1])
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

export async function detectImages(model: tf.GraphModel, imageFiles: File[]): Promise<DetectionResult[]> {
  const results: DetectionResult[] = []

  for (let i = 0; i < imageFiles.length; i++) {
    try {
      const image = await fileToImage(imageFiles[i])
      const detections = await detectSingleImage(model, image)

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

function getRightPathOfImage(imageUrl: string, language: string): Promise<string> {
  const baseName = imageUrl.split('/').at(-1)
  const localizedPath = `/images/${language}/${baseName}`
  const fallbackPath = `/images/en-US/${baseName}`

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      console.log('[Image Load] Success:', localizedPath)
      resolve(localizedPath)
    }
    img.onerror = () => {
      console.warn('[Image Load] Failed:', localizedPath, 'returning', fallbackPath, 'instead')
      resolve(fallbackPath)
    }
    img.src = localizedPath
  })
}
export async function extractCardImages(file: File, detections: DetectionResult, hashes: Hashes, language: string) {
  if (!file.type.startsWith('image/')) {
    throw new Error('PokemonCardDetectorComponent.tsx:extractCardImages: Invalid file type')
  }
  if (!hashes) {
    throw new Error('Cant extract card images: hashes not loaded yet')
  }
  const image = new Image()
  const imageUrl = URL.createObjectURL(file)

  return new Promise<ExtractedCard[]>((resolve) => {
    image.onload = async () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx === null) {
        throw new Error('Failed creating context')
      }

      const extractedCards = await Promise.all(
        detections.detections
          .filter((detection) => detection.confidence >= 50)
          .map(async (detection) => {
            const [[x1, y1], _1, [x2, y2], _2] = detection.points
            const width = x2 - x1
            const height = y2 - y1

            canvas.width = width
            canvas.height = height

            ctx.drawImage(image, x1, y1, width, height, 0, 0, width, height)

            const cardImageUrl = canvas.toDataURL('image/png')
            const buffers = await imageToBuffers(cardImageUrl)
            const hash = calculatePerceptualHash(buffers)

            // Calculate similarityes for all cards from the selected expansion and sort them
            const matches = Object.keys(hashes)
              .map((k) => [Number(k), calculateSimilarity(hash, hashes[k])] as [number, number])
              .sort(([_1, a], [_2, b]) => b - a)
            console.log(`Confidence: ${matches[0][1] - matches[1][1]}\n`, 'Best matches:', matches.slice(0, 5))

            const [id, similarity] = matches[0]
            const card = getCardByInternalId(id)
            if (!card) {
              throw new Error('Hashes key does not correspond to any card')
            }
            const resolvedImageUrl = await getRightPathOfImage(card.image, language)

            return {
              matchedCard: { card, similarity },
              imageUrl: cardImageUrl,
              resolvedImageUrl,
              increment: 1,
            }
          }),
      )

      URL.revokeObjectURL(imageUrl)
      resolve(extractedCards)
    }
    if (imageUrl.startsWith('blob:')) {
      image.src = imageUrl
    } else {
      console.error('Invalid image URL:', imageUrl)
      URL.revokeObjectURL(imageUrl)
      throw new Error('PokemonCardDetectorComponent.tsx:extractCardImages: Invalid image URL')
    }
  })
}
