import fs from 'node:fs'
import path from 'node:path'

const CARD_DATA_DIR = 'frontend/assets/cards'
const TRANSLATIONS_DIR = 'frontend/assets'
const SUPPORTED_LANGUAGES = ['en-US', 'es-ES', 'pt-BR', 'fr-FR', 'it-IT']

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`Could not load ${filePath}:`, error.message)
    return {}
  }
}

function saveJsonFile(filePath, data) {
  const jsonContent = JSON.stringify(data, null, 2)
  fs.writeFileSync(filePath, jsonContent, 'utf8')
}

function createTranslationEntry(cardName, cardType, ex) {
  const entry = {}
  let enUSName = cardName
  if (cardType === 'pokémon' && ex === 'yes') {
    enUSName = cardName.slice(0, -3)
  }
  for (const lang of SUPPORTED_LANGUAGES) {
    entry[lang] = lang === 'en-US' ? enUSName : null
  }
  return entry
}

function transformCardNameToKey(cardName, cardType, ex) {
  if (cardType === 'pokémon' && ex === 'yes') {
    return cardName.slice(0, -3).toLowerCase()
  }
  return cardName.toLowerCase()
}

function getAllCardFiles() {
  const files = fs.readdirSync(CARD_DATA_DIR)
  return files.filter((file) => file.endsWith('.json')).map((file) => path.join(CARD_DATA_DIR, file))
}

function extractCardsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const cards = JSON.parse(content)
    return Array.isArray(cards) ? cards : []
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return []
  }
}

function syncTranslations() {
  console.log('Starting translation sync...')

  const pokemonTranslations = loadJsonFile(path.join(TRANSLATIONS_DIR, 'pokemon_translations.json'))
  const toolsTranslations = loadJsonFile(path.join(TRANSLATIONS_DIR, 'tools_translations.json'))
  const trainersTranslations = loadJsonFile(path.join(TRANSLATIONS_DIR, 'trainers_translations.json'))

  let pokemonAdded = 0
  let toolsAdded = 0
  let trainersAdded = 0

  const cardFiles = getAllCardFiles()
  console.log(`Found ${cardFiles.length} card data files`)

  for (const cardFile of cardFiles) {
    const cards = extractCardsFromFile(cardFile)
    const fileName = path.basename(cardFile)
    console.log(`Processing ${fileName} (${cards.length} cards)`)

    for (const card of cards) {
      if (!card.name || typeof card.name !== 'string') {
        continue
      }

      const key = transformCardNameToKey(card.name, card.card_type, card.ex)

      if (card.card_type === 'pokémon') {
        if (!pokemonTranslations[key]) {
          pokemonTranslations[key] = createTranslationEntry(card.name, card.card_type, card.ex)
          pokemonAdded++
        }
      } else if (card.card_type === 'trainer') {
        if (card.evolution_type === 'item' || card.evolution_type === 'tool') {
          if (!toolsTranslations[key]) {
            toolsTranslations[key] = createTranslationEntry(card.name, card.card_type, card.ex)
            toolsAdded++
          }
        } else if (card.evolution_type === 'supporter') {
          if (!trainersTranslations[key]) {
            trainersTranslations[key] = createTranslationEntry(card.name, card.card_type, card.ex)
            trainersAdded++
          }
        }
      }
    }
  }

  saveJsonFile(path.join(TRANSLATIONS_DIR, 'pokemon_translations.json'), pokemonTranslations)
  saveJsonFile(path.join(TRANSLATIONS_DIR, 'tools_translations.json'), toolsTranslations)
  saveJsonFile(path.join(TRANSLATIONS_DIR, 'trainers_translations.json'), trainersTranslations)

  console.log('Translation sync completed!')
  console.log(`Pokemon translations added: ${pokemonAdded}`)
  console.log(`Tools translations added: ${toolsAdded}`)
  console.log(`Trainers translations added: ${trainersAdded}`)
  console.log(`Total entries added: ${pokemonAdded + toolsAdded + trainersAdded}`)

  if (pokemonAdded + toolsAdded + trainersAdded === 0) {
    console.log('All translations are already up to date!')
  }
}

syncTranslations()
