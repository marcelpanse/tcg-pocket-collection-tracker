// Builds frontend/assets/cards.json from the Pokémon Zone game data.
//
// Pokémon Zone is protected against bots, so the data has to be downloaded from a browser:
//   https://www.pokemon-zone.com/api/game/game-data/  -> pz-game-data.json
//   https://www.pokemon-zone.com/api/game/card-data/  -> pz-card-data.json
// Then run: pnpm import-pokemon-zone
// (or only the conversion: pnpm tsx scripts/import-pokemon-zone.ts [pz-game-data.json] [pz-card-data.json])
//
// internal_id is what users' collections are stored by, so existing ids are always kept.
// New ids are only computed for cards that are not in cards.json yet.
// Missing en-US images are downloaded from Pokémon Zone, existing ones are never replaced.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { expansions as allExpansions } from '../frontend/src/lib/CardsDB'
import { chunk } from '../frontend/src/lib/utils'
import type { Card, CardType, Expansion, ExpansionId, Rarity } from '../frontend/src/types'
import { encode } from './encoder'

const [gameDataPath = 'pz-game-data.json', cardDataPath = 'pz-card-data.json'] = process.argv.slice(2)
const cardsPath = 'frontend/assets/cards.json'
const imagesDir = 'frontend/public/images/en-US/'
const imagesPath = '/images/en-US/'
// Same size as the existing images
const imageWidth = 367
const imageHeight = 512

// The cards that should be the deckbuilding version, instead of the default "smallest internal_id"
const deckbuildingOverrides = [12583376, 12583248, 133058]

interface PzAttack {
  name: string
  damage: number
  isNoDamage: boolean
  damageSymbol: 'UNSPECIFIED' | 'Plus' | 'Multiply' | 'Minus'
  attackCost: string[]
  description: string | null
}

interface PzCard {
  cardId: string
  rarity: string
  illustratorNames: string[]
  illustrationUrl: string
  isPromotion: boolean
  name: string
  expansionCollectionNumbers: { expansionId: string; cardId: string; collectionNumber: number }[]
  pokemon: {
    pokemonId: string
    hp: number
    pokemonTypes: string[]
    evolutionStage: 'Basic' | 'One' | 'Two'
    retreatAmount: number
    weaknessType: string
    pokemonAttacks: PzAttack[]
    pokemonAbilities: { name: string; description: string }[]
    isEx: boolean
  } | null
  trainer: {
    trainerId: string
    trainerType: 'Supporter' | 'Item' | 'PokemonTool' | 'Stadium' | 'Fossil'
    description: string
  } | null
  variants: PzCard[]
  foundInPacks: string[]
  mirrorType: 'Normal' | 'NormalMirror'
}

interface PzGameData {
  packs: { packId: string; name: string }[]
  expansions: { expansionId: string; packIds: string[] }[]
}

const rarityMapping: Record<string, Rarity> = {
  C: '◊',
  U: '◊◊',
  R: '◊◊◊',
  RR: '◊◊◊◊',
  AR: '☆',
  SR: '☆☆',
  SAR: '☆☆',
  IM: '☆☆☆',
  S: '✵',
  SSR: '✵✵',
  UR: 'Crown Rare',
}

const symbolMapping: Record<string, string> = {
  grass: 'G',
  fire: 'R',
  water: 'W',
  lightning: 'L',
  psychic: 'P',
  fighting: 'F',
  darkness: 'D',
  metal: 'M',
  dragon: 'N',
  colorless: 'C',
}

const evolutionMapping = { Basic: 'basic', One: 'stage1', Two: 'stage2' } as const

// Fossils are played as Pokémon but are item cards
const trainerTypeMapping = { Supporter: 'supporter', Item: 'item', PokemonTool: 'tool', Stadium: 'stadium', Fossil: 'item' } as const

const damageSymbolMapping = { UNSPECIFIED: '', Plus: '+', Multiply: 'x', Minus: '-' } as const

/* Helper Functions */

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function expansionFromPz(expansionId: string): ExpansionId {
  return expansionId.replace('PROMO-', 'P-') as ExpansionId
}

// Pokémon Zone texts are HTML: energies are spans, line breaks are <br />
function toPlainText(html: string | null): string {
  if (!html) {
    return ''
  }
  return html
    .replace(/<span class="energy-text energy-text--type-(\w+)"><\/span>/g, (_match, type: string) => `[${symbolMapping[type.toLowerCase()] ?? '?'}]`)
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('’', "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function packOf(card: PzCard, expansion: Expansion, pzPackNames: Map<string, string>, expansionPackIds: string[]): string {
  const packs = card.foundInPacks.filter((packId) => expansionPackIds.includes(packId))
  if (expansion.packs.length <= 1 || packs.length !== 1) {
    return 'everypack'
  }
  // "Genetic Apex: Mewtwo" -> mewtwopack
  const pzName = pzPackNames.get(packs[0]) ?? ''
  const name = `${pzName.split(': ').pop()?.replaceAll(' ', '').toLowerCase()}pack`
  if (!expansion.packs.some((p) => p.name === name)) {
    throw new Error(`Unknown pack '${pzName}' for ${expansion.id}`)
  }
  return name
}

/* Conversion */

const gameData = readJson<PzGameData>(gameDataPath)
const pzCards: PzCard[] = []
const flatten = (card: PzCard) => {
  pzCards.push(card)
  card.variants.forEach(flatten)
}
readJson<{ cards: PzCard[] }>(cardDataPath).cards.forEach(flatten)
const pzById = new Map(pzCards.map((c) => [c.cardId, c]))

const existingCards = readJson<Card[]>(cardsPath)
const existingIds = new Map(existingCards.map((c) => [c.card_id, c.internal_id]))

const pzPackNames = new Map(gameData.packs.map((p) => [p.packId, p.name]))
const packIdsByExpansion = new Map(gameData.expansions.map((e) => [expansionFromPz(e.expansionId), e.packIds]))

// internal_id per Pokémon Zone card: reprints share the same game card, so they share the same internal_id
const internalIds = new Map<string, number>()
for (const card of pzById.values()) {
  const prints = card.expansionCollectionNumbers.map((n) => `${expansionFromPz(n.expansionId)}-${n.collectionNumber}`)
  const ids = new Set(prints.map((cardId) => existingIds.get(cardId)).filter((id) => id !== undefined))
  if (ids.size > 1) {
    throw new Error(`${card.cardId} matches several internal ids: ${[...ids]}`)
  }
  if (ids.size === 1) {
    internalIds.set(card.cardId, [...ids][0])
  }
}

const cards: Card[] = []
const pzCardIds = new Map<string, string>() // card_id -> Pokémon Zone cardId
const missingImages: { card_id: string; url: string }[] = []
const skippedExpansions = new Set<string>()

for (const pzCard of pzById.values()) {
  for (const { expansionId: pzExpansionId, collectionNumber } of pzCard.expansionCollectionNumbers) {
    const expansionId = expansionFromPz(pzExpansionId)
    const expansion = allExpansions.find((e) => e.id === expansionId)
    if (!expansion) {
      skippedExpansions.add(pzExpansionId)
      continue
    }

    const card_id = `${expansionId}-${collectionNumber}`
    pzCardIds.set(card_id, pzCard.cardId)
    const rarity: Rarity = expansion.promo ? 'P' : rarityMapping[pzCard.rarity]
    if (!rarity) {
      throw new Error(`Unknown rarity '${pzCard.rarity}' for ${card_id}`)
    }

    let internal_id = internalIds.get(pzCard.cardId)
    if (internal_id === undefined) {
      // New card: like before, the id is based on its first print
      internal_id = encode(expansion, collectionNumber, rarity)
      internalIds.set(pzCard.cardId, internal_id)
      console.log(`New card ${card_id} (${pzCard.name}): internal_id ${internal_id}`)
    }

    if (!fs.existsSync(path.join(imagesDir, `${card_id}.webp`))) {
      missingImages.push({ card_id, url: pzCard.illustrationUrl })
    }

    const { pokemon, trainer } = pzCard
    const energy: CardType = pokemon ? (pokemon.pokemonTypes[0].toLowerCase() as CardType) : 'trainer'

    const attacks: Card['attacks'] = (pokemon?.pokemonAttacks ?? []).map((attack) => ({
      cost: attack.attackCost.length > 0 ? attack.attackCost.map((cost) => cost.toLowerCase()) : ['No Cost'],
      name: toPlainText(attack.name),
      damage: attack.isNoDamage ? '0' : `${attack.damage}${damageSymbolMapping[attack.damageSymbol]}`,
      effect: toPlainText(attack.description) || 'No effect',
    }))

    let ability: Card['ability']
    if (pokemon?.pokemonAbilities.length) {
      const [{ name, description }] = pokemon.pokemonAbilities
      ability = { name: toPlainText(name), effect: toPlainText(description) || 'No effect' }
    } else if (trainer) {
      ability = { name: '', effect: toPlainText(trainer.description) }
    }

    const hp = pokemon?.hp ?? (trainer?.trainerType === 'Fossil' ? 40 : undefined)
    const weakness = pokemon ? (pokemon.weaknessType === 'UNSPECIFIED' ? 'none' : pokemon.weaknessType.toLowerCase()) : 'N/A'

    cards.push({
      expansion: expansionId,
      card_id,
      image: `${imagesPath}${card_id}.webp`,
      hp,
      energy,
      name: toPlainText(pzCard.name),
      card_type: pokemon ? 'pokémon' : 'trainer',
      evolution_type: pokemon ? evolutionMapping[pokemon.evolutionStage] : trainerTypeMapping[trainer.trainerType],
      attacks,
      ability,
      weakness,
      retreat: pokemon?.retreatAmount,
      rarity,
      ex: pokemon?.isEx ?? false,
      // Not available in the game data: babies are the only 30 HP Pokémon without weakness
      baby: weakness === 'none' && hp === 30 && energy !== 'dragon',
      foil: pzCard.mirrorType === 'NormalMirror',
      pack: packOf(pzCard, expansion, pzPackNames, packIdsByExpansion.get(expansionId) ?? []),
      alternate_versions: [],
      artist: pzCard.illustratorNames.join('/') || 'Unknown',
      internal_id,
    } as Card)
  }
}

if (skippedExpansions.size > 0) {
  console.warn(`Skipped expansions missing from CardsDB: ${[...skippedExpansions].join(', ')}`)
}

// Alternate versions: every print of the same Pokémon / trainer card (same attacks and effects)
const versions = new Map<string, Set<number>>()
const keys = new Map(
  cards.map((c) => {
    const pzCard = pzById.get(pzCardIds.get(c.card_id) as string)
    return [c.card_id, pzCard?.pokemon?.pokemonId ?? pzCard?.trainer?.trainerId ?? c.card_id]
  }),
)
for (const card of cards) {
  const key = keys.get(card.card_id) as string
  versions.set(key, (versions.get(key) ?? new Set()).add(card.internal_id))
}
for (const card of cards) {
  card.alternate_versions = [...(versions.get(keys.get(card.card_id) as string) ?? [])].toSorted((a, b) => a - b)
  for (const overriding_id of deckbuildingOverrides) {
    const idx = card.alternate_versions.indexOf(overriding_id)
    if (idx >= 0) {
      card.alternate_versions.splice(idx, 1)
      card.alternate_versions.unshift(overriding_id)
    }
  }
}

// Same order as before: by expansion, then by card number
cards.sort((a, b) => {
  if (a.expansion !== b.expansion) {
    return a.expansion < b.expansion ? -1 : 1
  }
  return Number.parseInt(a.card_id.split('-').pop() as string, 10) - Number.parseInt(b.card_id.split('-').pop() as string, 10)
})

const removed = existingCards.filter((c) => !cards.some((card) => card.card_id === c.card_id))
if (removed.length > 0) {
  console.warn(`Cards missing from Pokémon Zone data: ${removed.map((c) => c.card_id).join(', ')}`)
}

fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2))
console.log(`Wrote ${cards.length} cards to ${cardsPath}`)

/* Images */

async function downloadImage(url: string, dest: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  const image = Buffer.from(await response.arrayBuffer())
  await sharp(image).resize(imageWidth, imageHeight, { fit: 'fill' }).webp().toFile(dest)
}

const failedImages: string[] = []
for (const images of chunk(missingImages, 10)) {
  await Promise.all(
    images.map(async ({ card_id, url }) => {
      try {
        await downloadImage(url, path.join(imagesDir, `${card_id}.webp`))
        console.log(`Downloaded image for ${card_id}`)
      } catch (error) {
        failedImages.push(card_id)
        console.warn(`Failed to download image for ${card_id} (${url}): ${error instanceof Error ? error.message : error}`)
      }
    }),
  )
}
if (failedImages.length > 0) {
  console.warn(`Missing images: ${failedImages.join(', ')}`)
}
