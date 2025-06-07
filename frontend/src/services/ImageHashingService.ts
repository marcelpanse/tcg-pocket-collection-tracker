export class ImageSimilarityService {
  private static instance: ImageSimilarityService
  private readonly hashSize: number = 48
  private readonly freqSize: number = 12

  private constructor() {}

  public static getInstance(): ImageSimilarityService {
    if (!ImageSimilarityService.instance) {
      ImageSimilarityService.instance = new ImageSimilarityService()
    }
    return ImageSimilarityService.instance
  }

  public async calculatePerceptualHash(imageData: string | HTMLImageElement): Promise<ArrayBuffer> {
    const img = await this.ensureImage(imageData)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = this.hashSize
    canvas.height = this.hashSize

    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, this.hashSize, this.hashSize)

      const imageData = ctx.getImageData(0, 0, this.hashSize, this.hashSize)
      const pixels = imageData.data
      const colorPixels = {
        r: new Array(this.hashSize * this.hashSize),
        g: new Array(this.hashSize * this.hashSize),
        b: new Array(this.hashSize * this.hashSize),
      }

      for (let i = 0; i < pixels.length; i += 4) {
        const index = i / 4
        colorPixels.r[index] = pixels[i]
        colorPixels.g[index] = pixels[i + 1]
        colorPixels.b[index] = pixels[i + 2]
      }

      const dctR = this.computeDCT(colorPixels.r)
      const dctG = this.computeDCT(colorPixels.g)
      const dctB = this.computeDCT(colorPixels.b)

      const averages = this.calculateChannelAverages(dctR, dctG, dctB)

      const len = dctR.length
      const buffer = new ArrayBuffer(Math.ceil(len / 10) * 4)
      const arr = new Uint32Array(buffer)
      for (let i = 0; i + 1 < len; i++) {
        let a = 0
        if (dctR[i + 1] > averages.r) a += 4
        if (dctG[i + 1] > averages.g) a += 2
        if (dctB[i + 1] > averages.b) a += 1
        arr[Math.floor(i / 10)] += a << (3 * (i % 10))
      }

      return buffer
    }

    throw new Error('Failed to process image')
  }

  private calculateChannelAverages(dctR: number[], dctG: number[], dctB: number[]) {
    let sumR = 0
    let sumG = 0
    let sumB = 0
    const len = dctR.length

    for (let i = 1; i < len; i++) {
      sumR += dctR[i]
      sumG += dctG[i]
      sumB += dctB[i]
    }

    const count = len - 1
    return {
      r: sumR / count,
      g: sumG / count,
      b: sumB / count,
    }
  }

  private computeDCT(pixels: number[]): number[] {
    const n = this.hashSize
    const result = new Array(this.freqSize * this.freqSize)

    for (let u = 0; u < this.freqSize; u++) {
      for (let v = 0; v < this.freqSize; v++) {
        let sum = 0
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            sum += pixels[y * n + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n)) * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * n))
          }
        }

        const cu = u === 0 ? 1 / Math.sqrt(2) : 1
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1

        result[u * this.freqSize + v] = ((2 * cu * cv) / n) * sum
      }
    }

    return result
  }

  public calculateHammingDistance(hash1: ArrayBuffer, hash2: ArrayBuffer): number {
    let distance = 0
    const arr1 = new Uint32Array(hash1)
    const arr2 = new Uint32Array(hash2)
    const len = Math.min(arr1.length, arr2.length)

    for (let i = 0; i < len; i++) {
      let diff = arr1[i] ^ arr2[i]
      while (diff) {
        diff &= diff - 1
        distance++
      }
    }

    return distance
  }

  private ensureImage(source: string | HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (source instanceof HTMLImageElement) {
        if (source.complete) {
          resolve(source)
        } else {
          source.onload = () => resolve(source)
          source.onerror = () => reject(new Error('Failed to load image'))
        }
      } else {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image from URL'))
        img.src = source
      }
    })
  }
}
