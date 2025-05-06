import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import fsExtra from 'fs-extra'
import sharp from 'sharp'

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

async function convertToWebp(pngPath, webpPath) {
  try {
    // Lee la imagen original
    const image = sharp(pngPath)
    const metadata = await image.metadata()
    const size = Math.max(metadata.width, metadata.height)

    // Crea un lienzo cuadrado y centra la imagen
    await image
      .extend({
        top: Math.floor((size - metadata.height) / 2),
        bottom: Math.ceil((size - metadata.height) / 2),
        left: Math.floor((size - metadata.width) / 2),
        right: Math.ceil((size - metadata.width) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // fondo transparente
      })
      .webp({ quality: 80 })
      .toFile(webpPath)

    console.log(`Converted ${path.basename(pngPath)} to centered WebP format`)

    fs.unlinkSync(pngPath)
    console.log(`Removed original PNG file: ${path.basename(pngPath)}`)
  } catch (error) {
    console.error(`Error converting image to centered WebP: ${error}`)
  }
}

async function downloadPokemonImages() {
  // Ensure target directory exists
  await fsExtra.ensureDir(targetDir)

  // Download each Pokémon image
  for (const [pack, pokemon] of Object.entries(pokemonMap)) {
    const imageUrl = `${pokemonImageBaseUrl}${pokemon}.png`
    const pngDest = path.join(targetDir, `${pokemon}.png`)
    const webpDest = path.join(targetDir, `${pokemon}.webp`)

    if (!fs.existsSync(webpDest)) {
      try {
        // Si no existe el archivo WebP pero existe el PNG, solo convertimos
        if (fs.existsSync(pngDest)) {
          console.log(`PNG for ${pack} (${pokemon}) exists. Converting to WebP...`)
          await convertToWebp(pngDest, webpDest)
        } else {
          // Si no existe ni el PNG ni el WebP, descargamos y luego convertimos
          console.log(`Downloading image for ${pack}: ${imageUrl}`)
          await downloadImage(imageUrl, pngDest)
          console.log(`Converting ${pokemon}.png to WebP format...`)
          await convertToWebp(pngDest, webpDest)
        }
      } catch (error) {
        console.error(`Error processing image for ${pack}:`, error)
      }
    } else {
      console.log(`WebP image for ${pack} (${pokemon}) already exists.`)
    }
  }

  console.log('Image download and conversion completed!')
}

// Run the main function
downloadPokemonImages().catch(console.error)
