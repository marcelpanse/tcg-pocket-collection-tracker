export const hashSize = 48
export const freqSize = 12

export interface PixelData {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

export async function imageToBuffers(image: string | HTMLImageElement): Promise<PixelData> {
  const img = await ensureImage(image)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to process image')
  }

  canvas.width = hashSize
  canvas.height = hashSize

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, hashSize, hashSize)

  const imageData = ctx.getImageData(0, 0, hashSize, hashSize)
  const pixels = imageData.data
  const colorPixels: PixelData = {
    r: new Array(hashSize * hashSize),
    g: new Array(hashSize * hashSize),
    b: new Array(hashSize * hashSize),
  }

  for (let i = 0; i < pixels.length; i += 4) {
    const index = i / 4
    colorPixels.r[index] = pixels[i]
    colorPixels.g[index] = pixels[i + 1]
    colorPixels.b[index] = pixels[i + 2]
  }

  return colorPixels
}

export function calculatePerceptualHash(colorPixels: PixelData): ArrayBuffer {
  const dctR = computeDCT(colorPixels.r)
  const dctG = computeDCT(colorPixels.g)
  const dctB = computeDCT(colorPixels.b)

  const buffer = new ArrayBuffer(Math.ceil((3 * (dctR.length - 1)) / 32) * 4)
  const arr = new Uint32Array(buffer)

  let j = 0
  const fillBuffer = (dct: number[]) => {
    let avg = 0
    for (let i = 1; i < dct.length; i++) {
      avg += dct[i]
    }
    avg /= dct.length - 1
    for (let i = 1; i < dct.length; i++, j++) {
      if (Math.abs(dct[i] - avg) < 1e-6) {
        console.warn('Numerical instability in hash calculation detected')
      }
      if (dct[i] > avg + 1e-15) {
        arr[Math.floor(j / 32)] |= 1 << (j % 32)
      }
    }
  }

  fillBuffer(dctR)
  fillBuffer(dctG)
  fillBuffer(dctB)

  return buffer
}

export function calculateSimilarity(hash1: ArrayBuffer, hash2: ArrayBuffer): number {
  // Calcuate hamming distance and map it to [0,1] similarity score

  let distance = 0
  const arr1 = new Uint32Array(hash1)
  const arr2 = new Uint32Array(hash2)
  if (arr1.length !== arr2.length) {
    console.warn('hash.ts:calculateSimilarity: Buffer length mismatch')
  }
  const len = Math.min(arr1.length, arr2.length)

  for (let i = 0; i < len; i++) {
    let diff = arr1[i] ^ arr2[i]
    while (diff) {
      diff &= diff - 1
      distance++
    }
  }

  return 1 - distance / (3 * (freqSize * freqSize - 1))
}

function computeDCT(pixels: number[]): number[] {
  const n = hashSize
  const result = new Array(freqSize * freqSize)

  for (let u = 0; u < freqSize; u++) {
    for (let v = 0; v < freqSize; v++) {
      let sum = 0
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          sum += pixels[y * n + x] * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n)) * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * n))
        }
      }

      const cu = u === 0 ? 1 / Math.sqrt(2) : 1
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1

      result[u * freqSize + v] = ((2 * cu * cv) / n) * sum
    }
  }

  return result
}

function ensureImage(source: string | HTMLImageElement): Promise<HTMLImageElement> {
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
