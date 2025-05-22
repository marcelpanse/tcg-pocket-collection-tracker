import type { Card, CollectionRow, Expansion, ExpansionId, Mission, Pack, Rarity } from '@/types'
import A1 from '../../assets/cards/A1.json'
import A1a from '../../assets/cards/A1a.json'
import A2 from '../../assets/cards/A2.json'
import A2a from '../../assets/cards/A2a.json'
import A2b from '../../assets/cards/A2b.json'
import A3 from '../../assets/cards/A3.json'
import PA from '../../assets/cards/P-A.json'
import A1Missions from '../../assets/themed-collections/A1-missions.json'
import A1aMissions from '../../assets/themed-collections/A1a-missions.json'
import A2Missions from '../../assets/themed-collections/A2-missions.json'
import A2aMissions from '../../assets/themed-collections/A2a-missions.json'
import A2bMissions from '../../assets/themed-collections/A2b-missions.json'
import A3Missions from '../../assets/themed-collections/A3-missions.json'

const update = (cards: Card[], expansionName: ExpansionId) => {
  for (const card of cards) {
    // we set the card_id to the linkedCardID if it exists, so we really threat it as a single card eventhough it appears in multiple expansions.
    // @ts-ignore there is an ID in the JSON, but I don't want it in the Type because you should always use the card_id, having both is confusing.
    card.card_id = card.linkedCardID || `${expansionName}-${card.id}`
    card.expansion = expansionName
  }
  return cards
}

const equivalent = (firstCard: Card, secondCard: Card) => {
  return (
    firstCard.name === secondCard.name &&
    firstCard.attacks.length === secondCard.attacks.length &&
    firstCard.attacks.every((a) => secondCard.attacks.some((atk) => atk.name === a.name))
  )
}

export const a1Cards: Card[] = update(A1 as unknown as Card[], 'A1')
export const a1aCards: Card[] = update(A1a as unknown as Card[], 'A1a')
export const a2Cards: Card[] = update(A2 as unknown as Card[], 'A2')
export const a2aCards: Card[] = update(A2a as unknown as Card[], 'A2a')
export const a2bCards: Card[] = update(A2b as unknown as Card[], 'A2b')
export const a3Cards: Card[] = update(A3 as unknown as Card[], 'A3')
export const paCards: Card[] = update(PA as unknown as Card[], 'P-A')
export const allCards: Card[] = [...a1Cards, ...a1aCards, ...a2Cards, ...a2aCards, ...a2bCards, ...a3Cards, ...paCards]

export const allCardsDict: Map<string, Card> = new Map(allCards.map((card) => [card.card_id, card]))

export const getCardById = (cardId: string): Card | undefined => {
  return allCardsDict.get(cardId)
}

export const a1Missions: Mission[] = A1Missions as unknown as Mission[]
export const a1aMissions: Mission[] = A1aMissions as unknown as Mission[]
export const a2Missions: Mission[] = A2Missions as unknown as Mission[]
export const a2aMissions: Mission[] = A2aMissions as unknown as Mission[]
export const a2bMissions: Mission[] = A2bMissions as unknown as Mission[]
export const a3Missions: Mission[] = A3Missions as unknown as Mission[]
export const allMissions: Mission[] = [...a1Missions, ...a1aMissions, ...a2Missions, ...a2aMissions, ...a2bMissions, ...a3Missions]

export const expansions: Expansion[] = [
  {
    name: 'geneticapex',
    id: 'A1',
    cards: a1Cards,
    packs: [
      { name: 'mewtwopack', color: '#986C88' },
      { name: 'charizardpack', color: '#E2711B' },
      { name: 'pikachupack', color: '#EDC12A' },
      { name: 'everypack', color: '#CCCCCC' },
    ],
    missions: a1Missions,
    tradeable: true,
  },
  {
    name: 'mythicalisland',
    id: 'A1a',
    cards: a1aCards,
    packs: [{ name: 'mewpack', color: '#FFC1EA' }],
    missions: a1aMissions,
    tradeable: true,
  },
  {
    name: 'space-timesmackdown',
    id: 'A2',
    cards: a2Cards,
    packs: [
      { name: 'dialgapack', color: '#A0C5E8' },
      { name: 'palkiapack', color: '#D5A6BD' },
      { name: 'everypack', color: '#CCCCCC' },
    ],
    missions: a2Missions,
    tradeable: true,
  },
  {
    name: 'triumphantlight',
    id: 'A2a',
    cards: a2aCards,
    packs: [{ name: 'arceuspack', color: '#E4D7CA' }],
    missions: a2aMissions,
    tradeable: true,
  },
  {
    name: 'shiningrevelry',
    id: 'A2b',
    cards: a2bCards,
    packs: [{ name: 'shiningrevelrypack', color: '#99F6E4' }],
    missions: a2bMissions,
    tradeable: true,
    containsShinies: true,
  },
  {
    name: 'celestialguardians',
    id: 'A3',
    cards: a3Cards,
    packs: [
      { name: 'lunalapack', color: '#A0ABE0' },
      { name: 'solgaleopack', color: '#CA793F' },
      { name: 'everypack', color: '#CCCCCC' },
    ],
    missions: a3Missions,
    tradeable: false,
    containsShinies: true,
  },
  {
    name: 'promo-a',
    id: 'P-A',
    cards: paCards,
    packs: [{ name: 'everypack', color: '#CCCCCC' }],
    tradeable: false,
    promo: true,
  },
]

export const expansionsDict: Map<string, Expansion> = new Map(expansions.map((expansion) => [expansion.id, expansion]))

export const getExpansionById = (expansion: string): Expansion | undefined => {
  return expansionsDict.get(expansion)
}

export const tradeableRaritiesDictionary: Record<Rarity, number | null> = {
  '◊': 0,
  '◊◊': 0,
  '◊◊◊': 120,
  '◊◊◊◊': 500,
  '☆': 500,
  '☆☆': null,
  '☆☆☆': null,
  '✵': null,
  '✵✵': null,
  'Crown Rare': null,
  P: null,
  '': null,
}

export const sellableForTokensDictionary: Record<Rarity, number | null> = {
  '◊': null,
  '◊◊': null,
  '◊◊◊': 25,
  '◊◊◊◊': 125,
  '☆': 100,
  '☆☆': 300,
  '☆☆☆': 300,
  '✵': 250,
  '✵✵': 650,
  'Crown Rare': 1500,
  P: null,
  '': null,
}

const basicCards: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊']

type CardWithAmount = Card & { amount_owned: number }

interface NrOfCardsOwnedProps {
  ownedCards: CollectionRow[]
  rarityFilter: Rarity[]
  numberFilter: number
  expansion?: Expansion
  packName?: string
  deckbuildingMode?: boolean
}
export const getNrOfCardsOwned = ({ ownedCards, rarityFilter, numberFilter, expansion, packName, deckbuildingMode }: NrOfCardsOwnedProps): number => {
  let allCardsWithAmounts = allCards
    .filter((a) => !a.linkedCardID)
    .map((ac) => {
      const amount = ownedCards.find((oc) => ac.card_id === oc.card_id)?.amount_owned || 0
      return { ...ac, amount_owned: amount }
    })
  if (deckbuildingMode) {
    // can't filter by card ID, because we are specifically looking for cards with the same name, attacks, and ability but different arts
    allCardsWithAmounts = allCardsWithAmounts
      .map((ac) => {
        const amount_owned = allCardsWithAmounts.filter((c) => equivalent(c, ac)).reduce((acc, rc) => acc + (rc.amount_owned || 0), 0)

        return { ...ac, amount_owned }
      })
      .filter((c) => basicCards.includes(c.rarity))
  }

  const filters = {
    number: (cr: CardWithAmount) => cr.amount_owned > numberFilter - 1,
    rarity: (cr: CardWithAmount) => {
      const cardRarity = getCardById(cr.card_id)?.rarity
      if (!rarityFilter.length || !cardRarity) return true
      return rarityFilter.includes(cardRarity)
    },
    expansion: (cr: CardWithAmount) => (expansion ? expansion.cards.find((c) => cr.card_id === c.card_id) : true),
    pack: (cr: CardWithAmount) => (expansion && packName ? expansion.cards.find((c) => c.pack === packName && cr.card_id === c.card_id) : true),
    deckbuildingMode: (cr: CardWithAmount) =>
      deckbuildingMode ? allCardsWithAmounts.find((c) => c.card_id === cr.card_id && c.amount_owned > numberFilter - 1) : true,
  }

  // biome-ignore format: improve readability for filters
  return allCardsWithAmounts
    .filter(filters.number)
    .filter(filters.rarity)
    .filter(filters.expansion)
    .filter(filters.pack)
    .filter(filters.deckbuildingMode)
    .length
}

interface TotalNrOfCardsProps {
  rarityFilter: Rarity[]
  expansion?: Expansion
  packName?: string
  deckbuildingMode?: boolean
}
export const getTotalNrOfCards = ({ rarityFilter, expansion, packName, deckbuildingMode }: TotalNrOfCardsProps) => {
  // note we have to filter out the cards with a linked card ID (Old Amber) because they are counted as the same card.
  let filteredCards = [...allCards].filter((c) => !c.linkedCardID)

  if (expansion) {
    filteredCards = expansion.cards
  }
  if (packName) {
    filteredCards = filteredCards.filter((c) => c.pack === packName)
  }

  if (rarityFilter.length > 0) {
    //filter out cards that are not in the rarity filter
    filteredCards = filteredCards.filter((c) => rarityFilter.includes(c.rarity))
  }

  if (deckbuildingMode) {
    filteredCards = filteredCards.filter((c) => c.fullart === 'No')
  }

  return filteredCards.length
}

const probabilityPerRarity1_3: Record<Rarity, number> = {
  '◊': 100,
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
  '': 0,
}
const probabilityPerRarity4: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 90,
  '◊◊◊': 5,
  '◊◊◊◊': 1.666,
  '☆': 2.572,
  '☆☆': 0.5,
  '☆☆☆': 0.222,
  '✵': 0,
  '✵✵': 0,
  'Crown Rare': 0.04,
  P: 0,
  '': 0,
}
const probabilityPerRarity5: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 60,
  '◊◊◊': 20,
  '◊◊◊◊': 6.664,
  '☆': 10.288,
  '☆☆': 2,
  '☆☆☆': 0.888,
  '✵': 0,
  '✵✵': 0,
  'Crown Rare': 0.16,
  P: 0,
  '': 0,
}
const probabilityPerRarity4Shiny: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 89,
  '◊◊◊': 4.9525,
  '◊◊◊◊': 1.666,
  '☆': 2.572,
  '☆☆': 0.5,
  '☆☆☆': 0.222,
  '✵': 0.71425,
  '✵✵': 0.33325,
  'Crown Rare': 0.04,
  P: 0,
  '': 0,
}
const probabilityPerRarity5Shiny: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 56,
  '◊◊◊': 19.81,
  '◊◊◊◊': 6.664,
  '☆': 10.288,
  '☆☆': 2,
  '☆☆☆': 0.888,
  '✵': 2.857,
  '✵✵': 1.333,
  'Crown Rare': 0.16,
  P: 0,
  '': 0,
}
const abilityByRarityToBeInRarePack: Record<Rarity, number> = {
  '◊': 0,
  '◊◊': 0,
  '◊◊◊': 0,
  '◊◊◊◊': 0,
  '☆': 1,
  '☆☆': 1,
  '☆☆☆': 1,
  '✵': 1,
  '✵✵': 1,
  'Crown Rare': 1,
  P: 0,
  '': 0,
}

interface PullRateProps {
  ownedCards: CollectionRow[]
  expansion: Expansion
  pack: Pack
  rarityFilter?: Rarity[]
  numberFilter?: number
  deckbuildingMode?: boolean
}
export const pullRate = ({ ownedCards, expansion, pack, rarityFilter = [], numberFilter = 1, deckbuildingMode = false }: PullRateProps) => {
  if (ownedCards.length === 0) {
    return 1
  }

  const cardsInPack = expansion.cards.filter((c) => c.pack === pack.name || c.pack === 'everypack')
  const cardsInRarePack = cardsInPack.filter((c) => abilityByRarityToBeInRarePack[c.rarity] === 1)

  let cardsInPackWithAmounts = cardsInPack.map((cip) => {
    const amount = ownedCards.find((oc) => cip.card_id === oc.card_id)?.amount_owned || 0
    return { ...cip, amount_owned: amount }
  })

  if (deckbuildingMode) {
    // This function adds all the full-art cards amounts to the basic versions, then removes the full-art ones from the list
    cardsInPackWithAmounts = cardsInPack
      .map((cip) => {
        const amount = cardsInPackWithAmounts.filter((innerCard) => equivalent(cip, innerCard)).reduce((acc, rc) => acc + (rc.amount_owned || 0), 0)

        return {
          ...cip,
          amount_owned: amount,
        }
      })
      .filter((c) => basicCards.includes(c.rarity))
  }

  let missingCards = cardsInPackWithAmounts.filter((c) => c.amount_owned <= numberFilter - 1)

  if (rarityFilter.length > 0) {
    //filter out cards that are not in the rarity filter
    missingCards = missingCards.filter((c) => {
      if (c.rarity === '') return false
      return rarityFilter.includes(c.rarity)
    })
  }

  let totalProbability1_3 = 0
  let totalProbability4 = 0
  let totalProbability5 = 0
  let rareProbability1_5 = 0
  for (const card of missingCards) {
    const rarityList = [card.rarity]
    // Skip cards that cannot be picked
    if (rarityList[0] === 'P' || rarityList[0] === '') continue

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

    let chanceToGetThisCard1_3 = 0
    let chanceToGetThisCard4 = 0
    let chanceToGetThisCard5 = 0
    let chanceToGetThisCardRare1_5 = 0

    for (const rarity of rarityList) {
      const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity).length

      // the chance to get this card is the probability of getting this card in the pack divided by the number of cards of this rarity
      chanceToGetThisCard1_3 += probabilityPerRarity1_3[rarity] / 100 / nrOfcardsOfThisRarity
      if (expansion.containsShinies) {
        chanceToGetThisCard4 += probabilityPerRarity4Shiny[rarity] / 100 / nrOfcardsOfThisRarity
        chanceToGetThisCard5 += probabilityPerRarity5Shiny[rarity] / 100 / nrOfcardsOfThisRarity
      } else {
        chanceToGetThisCard4 += probabilityPerRarity4[rarity] / 100 / nrOfcardsOfThisRarity
        chanceToGetThisCard5 += probabilityPerRarity5[rarity] / 100 / nrOfcardsOfThisRarity
      }
      chanceToGetThisCardRare1_5 += abilityByRarityToBeInRarePack[rarity] / cardsInRarePack.length
    }

    // add up the chances to get this card
    totalProbability1_3 += chanceToGetThisCard1_3
    totalProbability4 += chanceToGetThisCard4
    totalProbability5 += chanceToGetThisCard5
    rareProbability1_5 += chanceToGetThisCardRare1_5
  }

  // take the total probabilities per card draw (for the 1-3 you need to cube the probability) and multiply
  const chanceToGetNewCard = 0.9995 * (1 - (1 - totalProbability1_3) ** 3 * (1 - totalProbability4) * (1 - totalProbability5))
  const chanceToGetNewCardInRarePack = 0.0005 * (1 - (1 - rareProbability1_5) ** 5)

  // disjoint union of probabilities
  return chanceToGetNewCard + chanceToGetNewCardInRarePack
}

export const pullRateForSpecificCard = (expansion: Expansion, packName: string, card: Card) => {
  const cardsInPack = expansion.cards.filter((c) => c.pack === packName || c.pack === 'everypack')
  const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === card.rarity).length
  const cardsInRarePack = cardsInPack.filter((c) => abilityByRarityToBeInRarePack[c.rarity] === 1)

  const chanceToGetThisCard1_3 = probabilityPerRarity1_3[card.rarity] / 100 / nrOfcardsOfThisRarity
  let chanceToGetThisCard4: number
  let chanceToGetThisCard5: number
  if (expansion.containsShinies) {
    chanceToGetThisCard4 = probabilityPerRarity4Shiny[card.rarity] / 100 / nrOfcardsOfThisRarity
    chanceToGetThisCard5 = probabilityPerRarity5Shiny[card.rarity] / 100 / nrOfcardsOfThisRarity
  } else {
    chanceToGetThisCard4 = probabilityPerRarity4[card.rarity] / 100 / nrOfcardsOfThisRarity
    chanceToGetThisCard5 = probabilityPerRarity5[card.rarity] / 100 / nrOfcardsOfThisRarity
  }
  const chanceToGetThisCardRare1_5 = abilityByRarityToBeInRarePack[card.rarity] / cardsInRarePack.length

  // take the total probabilities per card draw (for the 1-3 you need to take the cube root of the probability) and multiply
  const chanceToGetNewCard = 0.9995 * (1 - (1 - chanceToGetThisCard1_3) ** 3 * (1 - chanceToGetThisCard4) * (1 - chanceToGetThisCard5))
  const chanceToGetNewCardInRarePack = 0.0005 * (1 - (1 - chanceToGetThisCardRare1_5) ** 5)

  // disjoint union of probabilities
  return (chanceToGetNewCard + chanceToGetNewCardInRarePack) * 100
}
