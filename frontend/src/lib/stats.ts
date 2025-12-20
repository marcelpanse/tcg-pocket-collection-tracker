import type { MissionDetailProps } from '@/components/Mission'
import type { Card, Expansion, ExpansionId, Mission, Pack, Rarity } from '@/types'
import { allCards, getCardById, getExpansionById } from './CardsDB'

const equivalent = (firstCard: Card, secondCard: Card) => {
  return firstCard.alternate_versions.includes(secondCard.internal_id)
}

const expansionCards = Object.groupBy(allCards, (c) => c.expansion) as Record<ExpansionId, Card[]>

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

// 4-card deluxe pack probabilities
const deluxePackProbabilities = {
  position1: createRarityProbability({ '◊': 100 }),
  position2: createRarityProbability({ '◊': 17.73, '◊◊': 82.27 }),
  position3: createRarityProbability({
    '◊': 23.021,
    '◊◊': 17.985,
    '◊◊◊': 40.659,
    '☆': 12.858,
    '☆☆': 2.5,
    '☆☆☆': 1.111,
    '✵✵': 1.667,
    'Crown Rare': 0.198,
  }),
  position4: createRarityProbability({ '◊◊◊◊': 100 }),
}

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

const getPositionProbability = (expansion: Expansion, position: number): Record<Rarity, number> => {
  const packStructure = expansion.packStructure

  // 4-card deluxe pack
  if (packStructure?.cardsPerPack === 4) {
    const positionKey = `position${position}` as keyof typeof deluxePackProbabilities
    return deluxePackProbabilities[positionKey] || standardPackProbabilities.positions1to3
  }

  // 5-card standard pack
  if (position <= 3) {
    return standardPackProbabilities.positions1to3
  }
  if (position === 4) {
    return expansion.containsShinies ? standardPackProbabilities.position4Shiny : standardPackProbabilities.position4
  }
  if (position === 5) {
    return expansion.containsShinies ? standardPackProbabilities.position5Shiny : standardPackProbabilities.position5
  }

  // Fallback (should never reach here)
  return standardPackProbabilities.positions1to3
}

export function pullRate(wantedCards: Card[], expansion: Expansion, pack: Pack, deckbuildingMode: boolean) {
  const cardsInPack = expansionCards[expansion.id].filter((c) => c.pack === pack.name || c.pack === 'everypack')
  return pullRateForCardSubset(
    wantedCards.filter((c) => c.expansion === expansion.id),
    expansion,
    cardsInPack,
    deckbuildingMode,
  )
}

export const pullRateForSpecificCard = (expansion: Expansion, packName: string, card: Card) => {
  const validatedPackName = packName === 'everypack' ? expansion?.packs[0].name : packName
  const cardsInPack = expansionCards[expansion.id].filter((c) => c.pack === validatedPackName || c.pack === 'everypack')
  return pullRateForCardSubset([card], expansion, cardsInPack, false) * 100
}

export const pullRateForSpecificMission = (mission: Mission, missionGridRows: MissionDetailProps[][]) => {
  const expansion = getExpansionById(mission.expansionId)
  const missingCards = [
    ...new Set(
      missionGridRows
        .flat()
        .filter((card) => !card.owned)
        .flatMap((card) => card.missionCardOptions)
        .map((cardId) => getCardById(cardId))
        .filter((card) => card !== undefined),
    ),
  ]
  return (
    expansion?.packs.map(
      (pack) =>
        [
          pack.name,
          pullRateForCardSubset(
            missingCards,
            expansion,
            expansionCards[expansion.id].filter((c) => c.pack === pack.name || c.pack === 'everypack'),
            false,
          ) * 100,
        ] as const,
    ) || []
  )
}

const pullRateForCardSubset = (missingCards: Card[], expansion: Expansion, cardsInPack: Card[], deckbuildingMode: boolean) => {
  const cardsInRarePack = cardsInPack.filter((c) => abilityByRarityToBeInRarePack[c.rarity] === 1)
  const missingCardsFromPack = missingCards.filter((c) => cardsInPack.some((card) => c.card_id === card.card_id))

  const cardsPerPack = expansion.packStructure?.cardsPerPack || 5
  const totalProbabilityPerPosition = Array(cardsPerPack).fill(0)
  let rareProbability1_5 = 0
  let babyProbability = 0
  for (const card of missingCardsFromPack) {
    const rarityList = [card.rarity]
    // Skip cards that cannot be picked
    if (rarityList[0] === 'P') {
      continue
    }

    if (deckbuildingMode) {
      // while in deckbuilding mode, we only have diamond cards in the list,
      // but want to include the chance of getting one of the missing cards as a more rare version,
      // so we add the rarities here
      const matchingCards = cardsInPack.filter((cip) => equivalent(cip, card))

      for (const mc of matchingCards) {
        if (!rarityList.includes(mc.rarity)) {
          rarityList.push(mc.rarity)
        }
      }
    }

    const chanceToGetThisCardPerPosition = Array(cardsPerPack).fill(0)
    let chanceToGetThisCardRare1_5 = 0
    let chanceToGetThisCardBaby = 0

    for (const rarity of rarityList) {
      if (card.baby && rarity !== 'Crown Rare' && expansion.containsBabies) {
        // if the card is a baby (but not Crown Rare), we only consider 6-card packs
        const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity && c.baby).length

        chanceToGetThisCardBaby += probabilityPerRarityBaby[rarity] / 100 / nrOfcardsOfThisRarity
      } else {
        // Crown Rare babies and non-baby cards use normal probability distributions
        const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity && (rarity === 'Crown Rare' || !c.baby)).length

        // Calculate probability for each position
        for (let position = 1; position <= cardsPerPack; position++) {
          const positionProbability = getPositionProbability(expansion, position)
          chanceToGetThisCardPerPosition[position - 1] += positionProbability[rarity] / 100 / nrOfcardsOfThisRarity
        }

        // Rare pack probability (only for 5-card packs)
        if (cardsPerPack === 5) {
          chanceToGetThisCardRare1_5 += abilityByRarityToBeInRarePack[rarity] / cardsInRarePack.length
        }
      }
    }

    // add up the chances to get this card
    for (let i = 0; i < cardsPerPack; i++) {
      totalProbabilityPerPosition[i] += chanceToGetThisCardPerPosition[i]
    }
    rareProbability1_5 += chanceToGetThisCardRare1_5
    babyProbability += chanceToGetThisCardBaby
  }

  // Calculate chance across all positions
  const chanceToGetInStandardPack = totalProbabilityPerPosition.reduce((acc, posProb) => acc * (1 - posProb), 1)

  // 4-card packs: no special packs (rare/baby)
  if (cardsPerPack === 4) {
    return 1 - chanceToGetInStandardPack
  }

  // 5-card packs: existing logic with rare/baby packs
  let chanceToGetNewCard = 0
  let chanceToGetNewCardInRarePack = 0
  let changeToGetNewCardIn6CardPack = 0

  if (expansion.containsBabies) {
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
