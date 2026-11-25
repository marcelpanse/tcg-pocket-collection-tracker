import type { MissionDetailProps } from '@/components/Mission'
import type { Card, Expansion, ExpansionId, Mission, Pack, PackStructure, Rarity } from '@/types'
import { allCards, getCardById, getExpansionById } from './CardsDB'

/**
 * Cards that belong to an expansion but never drop from its booster packs: they are only given as mission rewards.
 * pokemon-zone lists no pack for them, just as for cards that drop from every pack, so the scraper stores them as
 * 'everypack'. Left in the pack pools, they take a share of their rarity's odds in every pack of the expansion.
 * Check each new expansion's mission rewards for cards like these.
 */
const missionOnlyCardIds = new Set([
  'A1-283', // Mew ☆☆☆, Kanto Pokédex secret mission
  'C1-152', // Sweet Honey ☆, "Flower Garden Honey Gathering" missions
  'C1-183', // Pikachu ex ☆☆☆, "The Path to Pikachu ex" missions
  'C1-185', // Mega Mewtwo X ex ☆☆☆, "The Path to Mega Mewtwo X ex" missions
])

const packCardsByExpansion = Object.groupBy(
  allCards.filter((c) => !missionOnlyCardIds.has(c.card_id)),
  (c) => c.expansion,
) as Partial<Record<ExpansionId, Card[]>>

/** Every card that can drop from the given booster pack: its own cards plus the ones every pack of the expansion shares. */
const cardsInPack = (expansionId: ExpansionId, packName: string) =>
  (packCardsByExpansion[expansionId] ?? []).filter((c) => c.pack === packName || c.pack === 'everypack')

// Helper to create a full rarity probability record with defaults
const createRarityProbability = (probabilities: Partial<Record<Rarity, number>>): Record<Rarity, number> => ({
  '◊': 0,
  '◊◊': 0,
  '◊◊◊': 0,
  '◊◊◊◊': 0,
  '☆': 0,
  '☆☆': 0,
  '☆☆☆': 0,
  '✵': 0,
  '✵✵': 0,
  'Crown Rare': 0,
  P: 0,
  ...probabilities,
})

// Standard 5-card pack probabilities
const standardPackProbabilities = {
  positions1to3: createRarityProbability({ '◊': 100 }),
  position4: createRarityProbability({
    '◊◊': 90,
    '◊◊◊': 5,
    '◊◊◊◊': 1.666,
    '☆': 2.572,
    '☆☆': 0.5,
    '☆☆☆': 0.222,
    'Crown Rare': 0.04,
  }),
  position5: createRarityProbability({
    '◊◊': 60,
    '◊◊◊': 20,
    '◊◊◊◊': 6.664,
    '☆': 10.288,
    '☆☆': 2,
    '☆☆☆': 0.888,
    'Crown Rare': 0.16,
  }),
  position4Shiny: createRarityProbability({
    '◊◊': 89,
    '◊◊◊': 4.9525,
    '◊◊◊◊': 1.666,
    '☆': 2.572,
    '☆☆': 0.5,
    '☆☆☆': 0.222,
    '✵': 0.71425,
    '✵✵': 0.33325,
    'Crown Rare': 0.04,
  }),
  position5Shiny: createRarityProbability({
    '◊◊': 56,
    '◊◊◊': 19.81,
    '◊◊◊◊': 6.664,
    '☆': 10.288,
    '☆☆': 2,
    '☆☆☆': 0.888,
    '✵': 2.857,
    '✵✵': 1.333,
    'Crown Rare': 0.16,
  }),
}

// 4-card deluxe ex pack probabilities
// TODO: rework with foil odds if A4b comes back in rotation
// const deluxePackProbabilities = {
//   position1: createRarityProbability({'◊': 100}),
//   position2: createRarityProbability({'◊': 17.73, '◊◊': 82.27}),
//   position3: createRarityProbability({
//     '◊': 23.021,
//     '◊◊': 17.985,
//     '◊◊◊': 40.659,
//     '☆': 12.858,
//     '☆☆': 2.5,
//     '☆☆☆': 1.111,
//     '✵✵': 1.667,
//     'Crown Rare': 0.198,
//   }),
//   position4: createRarityProbability({'◊◊◊◊': 100}),
// }

const deluxeMegaPackProbabilities = {
  position1: createRarityProbability({ '◊': 100 }),
  position2: createRarityProbability({ '◊': 17.73, '◊◊': 82.27 }),
  position3: createRarityProbability({
    '◊◊◊': 33.96,
    '☆': 12.858,
    '☆☆': 2.125,
    '☆☆☆': 0.889,
    '✵✵': 1.667,
    'Crown Rare': 0.158,
  }),
  position4: createRarityProbability({ '◊◊◊◊': 100 }),
}

// 1-card Special Pack (SP1 First Partners): 99.95% one of the ☆ starters, 0.05% one of the Mews (no rarity symbol, stored as 'P')
const specialPackProbabilities = {
  position1: createRarityProbability({ '☆': 99.95, P: 0.05 }),
}

const foilProbability: Record<Rarity, number> = createRarityProbability({
  '◊': 21.385,
  '◊◊': 19.578,
  '◊◊◊': 9.03,
})

const abilityByRarityToBeInRarePack: Record<Rarity, number> = createRarityProbability({
  '☆': 1,
  '☆☆': 1,
  '☆☆☆': 1,
  '✵': 1,
  '✵✵': 1,
  'Crown Rare': 1,
})

const probabilityPerRarityBaby: Record<Rarity, number> = createRarityProbability({
  '◊◊◊': 87.1,
  '☆': 12.9,
})

function getPositionProbability(structure: PackStructure, position: number): Record<Rarity, number> {
  // 1-card special pack
  if (structure?.cardsPerPack === 1) {
    return specialPackProbabilities.position1
  }

  // 4-card deluxe pack
  if (structure?.cardsPerPack === 4) {
    // A4b and B4b have different probability distributions, reverify upon rerelease of one of these packs
    const positionKey = `position${position}` as keyof typeof deluxeMegaPackProbabilities
    return deluxeMegaPackProbabilities[positionKey] || standardPackProbabilities.positions1to3
  }

  // 5-card standard pack
  if (position <= 3) {
    return standardPackProbabilities.positions1to3
  }
  if (position === 4) {
    return structure.containsShinies ? standardPackProbabilities.position4Shiny : standardPackProbabilities.position4
  }
  if (position === 5) {
    return structure.containsShinies ? standardPackProbabilities.position5Shiny : standardPackProbabilities.position5
  }

  throw new Error('Invalid within pack pull position')
}

export function pullRate(wantedCards: Card[], expansion: Expansion, pack: Pack, deckbuildingMode: boolean) {
  if (!expansion.packStructure) {
    throw new Error(`${expansion.id}: can't calculate probability without 'packStructure' field`)
  }
  return pullRateForCardSubset(
    wantedCards.filter((c) => c.expansion === expansion.id),
    cardsInPack(expansion.id, pack.name),
    expansion.packStructure,
    deckbuildingMode,
  )
}

export const pullRateForSpecificCard = (expansion: Expansion, packName: string, card: Card) => {
  if (!expansion.packStructure) {
    throw new Error(`${expansion.id}: can't calculate probability without 'packStructure' field`)
  }
  const validatedPackName = packName === 'everypack' ? expansion?.packs[0].name : packName
  return pullRateForCardSubset([card], cardsInPack(expansion.id, validatedPackName), expansion.packStructure, false) * 100
}

export const pullRateForSpecificMission = (mission: Mission, missionGridRows: MissionDetailProps[][]) => {
  const expansion = getExpansionById(mission.expansionId)
  const packStructure = expansion.packStructure
  if (!packStructure) {
    throw new Error(`${expansion.id}: can't calculate probability without 'packStructure' field`)
  }
  const missingCards = [
    ...new Set(
      missionGridRows
        .flat()
        .filter((card) => !card.owned)
        .flatMap((card) => card.missionCardOptions)
        .map(getCardById)
        .filter((card) => card !== undefined),
    ),
  ]
  return (
    expansion?.packs.map(
      (pack) => [pack.name, pullRateForCardSubset(missingCards, cardsInPack(expansion.id, pack.name), packStructure, false) * 100] as const,
    ) || []
  )
}

const pullRateForCardSubset = (missingCards: Card[], cardsInPack: Card[], structure: PackStructure, deckbuildingMode: boolean) => {
  const cardsInRarePack = cardsInPack.filter((c) => abilityByRarityToBeInRarePack[c.rarity] === 1)

  const missingIds = new Set(missingCards.map((c) => c.internal_id))
  const missingCardsFromPack = cardsInPack.filter(
    deckbuildingMode ? (c) => c.alternate_versions.some((id) => missingIds.has(id)) : (c) => missingIds.has(c.internal_id),
  )

  const totalProbabilityPerPosition = Array(structure.cardsPerPack).fill(0)
  let rareProbability1_5 = 0
  let babyProbability = 0
  for (const card of missingCardsFromPack) {
    const rarityList = [card.rarity]
    // Skip cards that cannot be picked
    if (rarityList[0] === 'P') {
      continue
    }

    const chanceToGetThisCardPerPosition = Array(structure.cardsPerPack).fill(0)
    let chanceToGetThisCardRare1_5 = 0
    let chanceToGetThisCardBaby = 0

    for (const rarity of rarityList) {
      if (card.baby && rarity !== 'Crown Rare' && structure.containSixthCardBabies) {
        // if the card is a baby (but not Crown Rare), we only consider 6-card packs
        const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity && c.baby).length

        chanceToGetThisCardBaby += probabilityPerRarityBaby[rarity] / 100 / nrOfcardsOfThisRarity
      } else if (card.foil) {
        const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity && c.foil).length
        chanceToGetThisCardPerPosition[2] = foilProbability[rarity] / 100 / nrOfcardsOfThisRarity
      } else {
        // Crown Rare babies and non-baby cards use normal probability distributions
        const nrOfcardsOfThisRarity = cardsInPack.filter(
          (c) => c.rarity === rarity && (rarity === 'Crown Rare' || !(c.baby && structure.containSixthCardBabies)) && !c.foil,
        ).length

        // Calculate probability for each position
        for (let position = 1; position <= structure.cardsPerPack; position++) {
          const positionProbability = getPositionProbability(structure, position)
          chanceToGetThisCardPerPosition[position - 1] += positionProbability[rarity] / 100 / nrOfcardsOfThisRarity
        }

        // Rare pack probability (only for 5-card packs)
        if (structure.cardsPerPack === 5) {
          chanceToGetThisCardRare1_5 += abilityByRarityToBeInRarePack[rarity] / cardsInRarePack.length
        }
      }
    }

    // add up the chances to get this card
    for (let i = 0; i < structure.cardsPerPack; i++) {
      totalProbabilityPerPosition[i] += chanceToGetThisCardPerPosition[i]
    }
    rareProbability1_5 += chanceToGetThisCardRare1_5
    babyProbability += chanceToGetThisCardBaby
  }

  // Calculate chance across all positions
  const chanceToGetInStandardPack = totalProbabilityPerPosition.reduce((acc, posProb) => acc * (1 - posProb), 1)

  // 1- and 4-card packs: no special packs (rare/baby)
  if (structure.cardsPerPack !== 5) {
    return 1 - chanceToGetInStandardPack
  }

  // 5-card packs: existing logic with rare/baby packs
  let chanceToGetNewCard = 0
  let chanceToGetNewCardInRarePack = 0
  let changeToGetNewCardIn6CardPack = 0

  if (structure.containSixthCardBabies) {
    chanceToGetNewCard = 0.9162 * (1 - chanceToGetInStandardPack)
    chanceToGetNewCardInRarePack = 0.0005 * (1 - (1 - rareProbability1_5) ** 5)
    changeToGetNewCardIn6CardPack = 0.0833 * (1 - chanceToGetInStandardPack * (1 - babyProbability))
  } else {
    chanceToGetNewCard = 0.9995 * (1 - chanceToGetInStandardPack)
    chanceToGetNewCardInRarePack = 0.0005 * (1 - (1 - rareProbability1_5) ** 5)
  }

  // disjoint union of probabilities
  return chanceToGetNewCard + chanceToGetNewCardInRarePack + changeToGetNewCardIn6CardPack
}
