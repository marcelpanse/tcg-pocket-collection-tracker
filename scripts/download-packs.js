import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import fsExtra from 'fs-extra'

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Define the expansions you want to process. You can use the same array as in scraper.js if applicable.
const expansions = ['A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'P-A']

// Base URL for expansion images
const expansionImageBaseUrl = 'https://s3.limitlesstcg.com/pocket/sets/'

// Target directory to save expansion images
const targetDir = 'frontend/public/images/sets/'

async function downloadImage(imageUrl, dest) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const stream = response.body
  const writer = fs.createWriteStream(dest)
  await pipeline(stream, writer)
}

async function downloadExpansionImages() {
  await fsExtra.ensureDir(targetDir)

  for (const expansion of expansions) {
    const imageUrl = `${expansionImageBaseUrl}${expansion}.webp`
    const dest = path.join(targetDir, `${expansion}.webp`)

    if (!fs.existsSync(dest)) {
      try {
        console.log(`Downloading image for expansion ${expansion}: ${imageUrl}`)
        await downloadImage(imageUrl, dest)
      } catch (error) {
        console.error(`Error downloading image for expansion ${expansion}:`, error)
      }
    } else {
      console.log(`Image for expansion ${expansion} already exists.`)
    }
  }
}

downloadExpansionImages().catch(console.error)
