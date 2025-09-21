import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import sharp from 'sharp'
import { calculatePerceptualHash, hashSize } from '../frontend/src/lib/hash.ts'

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

function hashPath(locale) {
  return path.join(targetDir, locale, 'hashes.json')
}

async function loadImage(imgPath) {
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

async function generateHash(card_id, locale) {
  const imgPath = path.join(imagesDir, locale, `${card_id}.webp`)

  // check if localized image exists
  try {
    await fs.promises.access(imgPath)
  } catch {
    return undefined
  }

  const colorPixels = await loadImage(imgPath)
  const hash = calculatePerceptualHash(colorPixels)
  const encoded = Buffer.from(new Uint8Array(hash)).toString('base64')
  return encoded
}

const hashes = Object.fromEntries(
  await Promise.all(
    locales.map(async (x) => {
      try {
        const data = await fs.promises.readFile(hashPath(x))
        return [x, JSON.parse(data)]
      } catch {
        return [x, {}]
      }
    }),
  ),
)

const handleCard = async (card_id, locale) => {
  const hash = await generateHash(card_id, locale)
  if (values.verify) {
    if (hashes[locale][card_id] !== hash) {
      console.log(`Incorrect hash for ${card_id} for locale ${locale}:`)
      console.log(`Stored:    ${hashes[locale][card_id]}`)
      console.log(`Calcuated: ${hash}`)
      ret |= 1
    }
  } else {
    hashes[locale][card_id] = hash
  }
}

const expansionFiles = await fs.promises.readdir(cardsDir)
for (const expansionFile of expansionFiles) {
  const data = await fs.promises.readFile(path.join(cardsDir, expansionFile))
  const cards = JSON.parse(data)
  console.log(expansionFile)
  for (const locale of locales) {
    await Promise.all(cards.map((card) => handleCard(card.card_id, locale)))
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
