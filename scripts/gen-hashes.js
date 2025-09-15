import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { calculatePerceptualHash, hashSize } from '../frontend/src/lib/hash.ts'

const imagesDir = 'frontend/public/images'
const targetDir = 'frontend/public/hashes'
const cardsDir = 'frontend/assets/cards'
const locales = ['en-US', 'es-ES', 'fr-FR', 'it-IT', 'pt-BR']

const expectedBufferLength = hashSize * hashSize * 3

async function load(imgPath) {
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
  try {
    await fs.promises.access(imgPath)
  } catch {
    return undefined
  }
  const colorPixels = await load(imgPath)
  const hash = calculatePerceptualHash(colorPixels)
  const encoded = Buffer.from(new Uint8Array(hash)).toString('base64')
  return encoded
}

const hashes = Object.fromEntries(locales.map((x) => [x, {}]))

const expansionFiles = await fs.promises.readdir(cardsDir)
for (const expansionFile of expansionFiles) {
  const data = await fs.promises.readFile(path.join(cardsDir, expansionFile))
  const cards = JSON.parse(data)
  for (const card of cards) {
    console.log(card.card_id)
    for (const locale of locales) {
      const hash = await generateHash(card.card_id, locale)
      hashes[locale][card.card_id] = hash
    }
  }
}

for (const [locale, data] of Object.entries(hashes)) {
  const outDir = path.join(targetDir, locale)
  await fs.promises.mkdir(outDir, { recursive: true })
  await fs.promises.writeFile(path.join(outDir, 'hashes.json'), JSON.stringify(data, null, 2))
  console.log('Hashes saved to', outDir)
}
