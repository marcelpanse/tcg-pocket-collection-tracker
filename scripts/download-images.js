import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'
import fsExtra from 'fs-extra'

const readFileAsync = promisify(fs.readFile)

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const cardFiles = [
  'frontend/assets/cards/A1.json',
  'frontend/assets/cards/A1a.json',
  'frontend/assets/cards/A2.json',
  'frontend/assets/cards/A2a.json',
  'frontend/assets/cards/A2b.json',
  'frontend/assets/cards/A3.json',
  'frontend/assets/cards/P-A.json',
]

const targetDir = 'frontend/public/images/en-US/'

async function downloadImage(imageUrl, dest) {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const stream = response.body
  const writer = fs.createWriteStream(dest)

  await pipeline(stream, writer)
}

async function processFiles() {
  await fsExtra.ensureDir(targetDir)

  for (const file of cardFiles) {
    try {
      const content = await readFileAsync(file, 'utf8')
      const cards = JSON.parse(content)

      for (const card of cards) {
        if (!card.image) continue

        const imageUrl = card.image
        const imageName = path.basename(imageUrl)
        const imagePath = path.join(targetDir, imageName)

        if (!fs.existsSync(imagePath)) {
          console.log(`Downloading: ${imageUrl}`)
          await downloadImage(imageUrl, imagePath)
        } else {
          console.log(`Skipping, already exists: ${imageName}`)
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error)
    }
  }
}

processFiles().catch(console.error)
