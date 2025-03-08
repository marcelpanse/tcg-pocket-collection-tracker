export class ImageSimilarityService {
  private static instance: ImageSimilarityService
  private readonly hashSize: number = 24

  private constructor() {}

  public static getInstance(): ImageSimilarityService {
    if (!ImageSimilarityService.instance) {
      ImageSimilarityService.instance = new ImageSimilarityService()
    }
    return ImageSimilarityService.instance
  }

  public async calculatePerceptualHash(imageData: string | HTMLImageElement): Promise<string> {
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

      const freqSize = Math.floor(this.hashSize / 4)
      const averages = this.calculateChannelAverages(dctR, dctG, dctB, freqSize)

      let hash = ''
      for (let y = 0; y < freqSize; y++) {
        for (let x = 0; x < freqSize; x++) {
          if (!(x === 0 && y === 0)) {
            const pos = y * this.hashSize + x
            hash += dctR[pos] > averages.r ? '1' : '0'
            hash += dctG[pos] > averages.g ? '1' : '0'
            hash += dctB[pos] > averages.b ? '1' : '0'
          }
        }
      }

      return hash
    }

    throw new Error('Failed to process image')
  }

  private calculateChannelAverages(dctR: number[], dctG: number[], dctB: number[], freqSize: number) {
    let sumR = 0
    let sumG = 0
    let sumB = 0
    let count = 0

    for (let y = 0; y < freqSize; y++) {
      for (let x = 0; x < freqSize; x++) {
        if (!(x === 0 && y === 0)) {
          const pos = y * this.hashSize + x
          sumR += dctR[pos]
          sumG += dctG[pos]
          sumB += dctB[pos]
          count++
        }
      }
    }

    return {
      r: sumR / count,
      g: sumG / count,
      b: sumB / count,
    }
  }

  private computeDCT(pixels: number[]): number[] {
    const n = this.hashSize
    const result = new Array(n * n)

    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        let sum = 0
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            sum += pixels[y * n + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n)) * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * n))
          }
        }

        const cu = u === 0 ? 1 / Math.sqrt(2) : 1
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1

        result[u * n + v] = ((2 * cu * cv) / n) * sum
      }
    }

    return result
  }

  public calculateHammingDistance(hash1: string, hash2: string): number {
    let distance = 0
    const minLength = Math.min(hash1.length, hash2.length)

    for (let i = 0; i < minLength; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++
      }
    }

    distance += Math.abs(hash1.length - hash2.length)

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
