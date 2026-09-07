import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import fsExtra from 'fs-extra'

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Define the expansions you want to process. You can use the same array as in scraper.js if applicable.
const expansions = [
  'A1',
  'A1a',
  'A2',
  'A2a',
  'A2b',
  'A3',
  'A3a',
  'A3b',
  'A4',
  'A4a',
  'A4b',
  'B1',
  'B1a',
  'B2',
  'B2a',
  'B2b',
  'B3',
  'B3a',
  'B3b',
  'B4',
  'B4a',
  'P-A',
]

// Base URL for expansion images
const expansionImageBaseUrl = 'https://s3.limitlesstcg.com/pocket/sets/'

// Target directory to save expansion images
const targetDir = 'frontend/public/images/sets/en-US/'

async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function sha1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex')
}

async function downloadExpansionImages() {
  await fsExtra.ensureDir(targetDir)

  for (const expansion of expansions) {
    const imageUrl = `${expansionImageBaseUrl}${expansion}.webp`
    const dest = path.join(targetDir, `${expansion}.webp`)

    try {
      const remote = await fetchImage(imageUrl)
      // Always refresh: Limitless replaces early placeholders once the real
      // set logo lands, so a plain existsSync check leaves the old one behind
      // forever. Skip the write when the bytes match to keep git tidy.
      if (fs.existsSync(dest) && sha1(fs.readFileSync(dest)) === sha1(remote)) {
        console.log(`Image for expansion ${expansion} unchanged.`)
        continue
      }
      console.log(`Updating image for expansion ${expansion}: ${imageUrl}`)
      fs.writeFileSync(dest, remote)
    } catch (error) {
      console.error(`Error downloading image for expansion ${expansion}:`, error)
    }
  }
}

downloadExpansionImages().catch(console.error)
