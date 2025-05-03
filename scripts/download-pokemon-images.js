import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import fsExtra from 'fs-extra'

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// Mapping of packs to Pokémon
const pokemonMap = {
  pikachupack: 'pikachu',
  charizardpack: 'charizard',
  mewtwopack: 'mewtwo',
  dialgapack: 'dialga',
  palkiapack: 'palkia',
  mewpack: 'mew',
  arceuspack: 'arceus',
  shiningrevelrypack: 'rayquaza',
  lunalapack: 'lunala',
  solgaleopack: 'solgaleo',
  everypack: 'eevee',
  all: 'mew',
}

// Base URL for Pokémon images
const pokemonImageBaseUrl = 'https://img.pokemondb.net/sprites/scarlet-violet/normal/'

// Target directory to save images
const targetDir = 'frontend/public/images/pokemon/'

async function downloadImage(imageUrl, dest) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Error downloading image: ${response.statusText}`)
  }
  const stream = response.body
  const writer = fs.createWriteStream(dest)
  await pipeline(stream, writer)
}

async function downloadPokemonImages() {
  // Ensure target directory exists
  await fsExtra.ensureDir(targetDir)

  // Download each Pokémon image
  for (const [pack, pokemon] of Object.entries(pokemonMap)) {
    const imageUrl = `${pokemonImageBaseUrl}${pokemon}.png`
    const dest = path.join(targetDir, `${pokemon}.png`)

    if (!fs.existsSync(dest)) {
      try {
        console.log(`Downloading image for ${pack}: ${imageUrl}`)
        await downloadImage(imageUrl, dest)
      } catch (error) {
        console.error(`Error downloading image for ${pack}:`, error)
      }
    } else {
      console.log(`Image for ${pack} (${pokemon}) already exists.`)
    }
  }

  console.log('Image download completed!')
}

// Run the main function
downloadPokemonImages().catch(console.error)
