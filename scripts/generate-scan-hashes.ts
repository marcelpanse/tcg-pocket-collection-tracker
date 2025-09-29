import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import sharp from 'sharp'
import { calculatePerceptualHash, calculateSimilarity, hashSize } from '../frontend/src/lib/hash.ts'
import type { Card } from '../frontend/src/types/index.ts'

console.log(`Using sharp ${sharp.versions.sharp}`)
console.log(`Using libvips ${sharp.versions.vips}`)
console.log(`Using libwebp ${sharp.versions.webp}`)

const imagesDir = 'frontend/public/images'
const targetDir = 'frontend/public/hashes'
const cardsDir = 'frontend/assets/cards'
const locales = ['en-US', 'es-ES', 'fr-FR', 'it-IT', 'pt-BR']

const { values } = parseArgs({
  options: {
    verify: { type: 'boolean' },
  },
})

let ret = 0

const expectedBufferLength = hashSize * hashSize * 3

function hashPath(locale: string) {
  return path.join(targetDir, locale, 'hashes.json')
}

async function loadImage(imgPath: string) {
  const { data } = await sharp(imgPath)
    .resize(hashSize, hashSize, {
      fit: 'fill',
      kernel: sharp.kernel.cubic,
    })
    .removeAlpha()
    .toColorspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (data.length !== expectedBufferLength) {
    throw new Error(`Unexpected data length: got ${data.length}, expected ${expectedBufferLength}`)
  }

  const colorPixels = {
    r: new Array(hashSize * hashSize),
    g: new Array(hashSize * hashSize),
    b: new Array(hashSize * hashSize),
  }

  for (let i = 0; i < data.length; i += 3) {
    const index = i / 3
    colorPixels.r[index] = data[i]
    colorPixels.g[index] = data[i + 1]
    colorPixels.b[index] = data[i + 2]
  }

  return colorPixels
}

async function generateHash(card_id: string, locale: string) {
  const imgPath = path.join(imagesDir, locale, `${card_id}.webp`)

  // check if localized image exists
  try {
    await fs.promises.access(imgPath)
  } catch {
    return undefined
  }

  const colorPixels = await loadImage(imgPath)
  return calculatePerceptualHash(colorPixels)
}

const hashes = Object.fromEntries(
  await Promise.all(
    locales.map(async (x) => {
      try {
        const data = await fs.promises.readFile(hashPath(x), 'utf8')
        return [x, JSON.parse(data)]
      } catch {
        return [x, {}]
      }
    }),
  ),
)

function checkSimilar(hash1: ArrayBuffer | undefined, hash2: ArrayBuffer | undefined) {
  if (hash1 === undefined && hash2 === undefined) {
    return true
  } else if (hash1 === undefined || hash2 === undefined) {
    return false
  } else {
    return calculateSimilarity(hash1, hash2) > 0.99
  }
}

function decode(hash: string) {
  const buf = Buffer.from(hash, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

const handleCard = async (card_id: string, locale: string) => {
  const hash = await generateHash(card_id, locale)
  if (values.verify) {
    const stored_string = hashes[locale][card_id]
    const stored_hash = stored_string && decode(stored_string)
    if (!checkSimilar(hash, stored_hash)) {
      console.log(`Incorrect hash for ${card_id} for locale ${locale}:`)
      console.log(`Stored:     ${stored_string}`)
      console.log(`Calculated: ${hash && Buffer.from(new Uint8Array(hash)).toString('base64')}`)
      ret |= 1
    }
  } else {
    if (hash) {
      hashes[locale][card_id] = Buffer.from(new Uint8Array(hash)).toString('base64')
    }
  }
}

const expansionFiles = await fs.promises.readdir(cardsDir)
for (const expansionFile of expansionFiles) {
  const data = await fs.promises.readFile(path.join(cardsDir, expansionFile), 'utf8')
  const cards = JSON.parse(data)
  console.log(expansionFile)
  for (const locale of locales) {
    await Promise.all(cards.map((card: Card) => handleCard(card.card_id, locale)))
  }
}

if (values.verify) {
  process.exit(ret)
} else {
  for (const [locale, data] of Object.entries(hashes)) {
    await fs.promises.mkdir(path.join(targetDir, locale), { recursive: true })
    await fs.promises.writeFile(hashPath(locale), JSON.stringify(data, null, 2))
  }
}
