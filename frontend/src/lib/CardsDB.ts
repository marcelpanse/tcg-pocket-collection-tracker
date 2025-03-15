import type { Card, CollectionRow, Expansion, ExpansionId, Pack, Rarity } from '@/types'
import A1 from '../../assets/cards/A1.json'
import A1a from '../../assets/cards/A1a.json'
import A2 from '../../assets/cards/A2.json'
import A2a from '../../assets/cards/A2a.json'
import PA from '../../assets/cards/P-A.json'

const update = (cards: Card[], expansionName: ExpansionId) => {
  for (const card of cards) {
    // we set the card_id to the linkedCardID if it exists, so we really threat it as a single card eventhough it appears in multiple expansions.
    // @ts-ignore there is an ID in the JSON, but I don't want it in the Type because you should always use the card_id, having both is confusing.
    card.card_id = card.linkedCardID || `${expansionName}-${card.id}`
    card.expansion = expansionName
  }
  return cards
}

export const a1Cards: Card[] = update(A1 as unknown as Card[], 'A1')
export const a1aCards: Card[] = update(A1a as unknown as Card[], 'A1a')
export const a2Cards: Card[] = update(A2 as unknown as Card[], 'A2')
export const a2aCards: Card[] = update(A2a as unknown as Card[], 'A2a')
export const paCards: Card[] = update(PA as unknown as Card[], 'P-A')
export const allCards: Card[] = [...a1Cards, ...a1aCards, ...a2Cards, ...a2aCards, ...paCards]

export const getCardById = (cardId: string): Card | undefined => {
  return allCards.find((card) => card.card_id === cardId)
}

export const expansions: Expansion[] = [
  {
    name: 'Genetic Apex',
    id: 'A1',
    cards: a1Cards,
    packs: [
      { name: 'Mewtwo pack', color: '#986C88' },
      { name: 'Charizard pack', color: '#E2711B' },
      { name: 'Pikachu pack', color: '#EDC12A' },
      { name: 'Every pack', color: '#CCCCCC' },
    ],
    tradeable: true,
  },
  {
    name: 'Mythical Island',
    id: 'A1a',
    cards: a1aCards,
    packs: [{ name: 'Mew pack', color: '#FFC1EA' }],
    tradeable: true,
  },
  {
    name: 'Space-Time Smackdown',
    id: 'A2',
    cards: a2Cards,
    packs: [
      { name: 'Dialga pack', color: '#A0C5E8' },
      { name: 'Palkia pack', color: '#D5A6BD' },
      { name: 'Every pack', color: '#CCCCCC' },
    ],
    tradeable: true,
  },
  {
    name: 'Triumphant Light',
    id: 'A2a',
    cards: a2aCards,
    packs: [{ name: 'Arceus pack', color: '#E4D7CA' }],
    tradeable: false,
  },
  {
    name: 'Promo-A',
    id: 'P-A',
    cards: paCards,
    packs: [{ name: 'Every pack', color: '#CCCCCC' }],
    tradeable: false,
    promo: true,
  },
]

export const tradeableRaritiesDictionary: Record<Rarity, number | null> = {
  '◊': 0,
  '◊◊': 0,
  '◊◊◊': 120,
  '◊◊◊◊': 500,
  '☆': 500,
  '☆☆': null,
  '☆☆☆': null,
  'Crown Rare': null,
  Unknown: null,
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
  'Crown Rare': 1500,
  Unknown: null,
  '': null,
}

interface NrOfCardsOwnedProps {
  ownedCards: CollectionRow[]
  rarityFilter: Rarity[]
  numberFilter: number
  expansion?: Expansion
  packName?: string
}
export const getNrOfCardsOwned = ({ ownedCards, rarityFilter, numberFilter, expansion, packName }: NrOfCardsOwnedProps): number => {
  const filters = {
    number: (cr: CollectionRow) => cr.amount_owned > numberFilter - 1,
    rarity: (cr: CollectionRow) => {
      const cardRarity = getCardById(cr.card_id)?.rarity
      if (!rarityFilter.length || !cardRarity) return true
      return rarityFilter.includes(cardRarity)
    },
    expansion: (cr: CollectionRow) => (expansion ? expansion.cards.find((c) => cr.card_id === c.card_id) : true),
    pack: (cr: CollectionRow) => (expansion && packName ? expansion.cards.find((c) => c.pack === packName && cr.card_id === c.card_id) : true),
  }

  // biome-ignore format: improve readability for filters
  return ownedCards
    .filter(filters.number)
    .filter(filters.rarity)
    .filter(filters.expansion)
    .filter(filters.pack)
    .length
}

interface TotalNrOfCardsProps {
  rarityFilter: Rarity[]
  expansion?: Expansion
  packName?: string
}
export const getTotalNrOfCards = ({ rarityFilter, expansion, packName }: TotalNrOfCardsProps) => {
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
  'Crown Rare': 0,
  Unknown: 0,
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
  'Crown Rare': 0.04,
  Unknown: 0,
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
  'Crown Rare': 0.16,
  Unknown: 0,
  '': 0,
}

interface PullRateProps {
  ownedCards: CollectionRow[]
  expansion: Expansion
  pack: Pack
  rarityFilter?: Rarity[]
  numberFilter?: number
}
export const pullRate = ({ ownedCards, expansion, pack, rarityFilter = [], numberFilter = 1 }: PullRateProps) => {
  if (ownedCards.length === 0) {
    return 1
  }

  //probabilities
  // console.log('calc pull rate for', pack.name, ownedCards.length, rarityFilter)

  const cardsInPack = expansion.cards.filter((c) => c.pack === pack.name || c.pack === 'Every pack')
  // console.log('cards in pack', cardsInPack.length) //79
  let missingCards = cardsInPack.filter((c) => !ownedCards.find((oc) => oc.card_id === c.card_id && oc.amount_owned > numberFilter - 1))

  if (rarityFilter.length > 0) {
    //filter out cards that are not in the rarity filter
    missingCards = missingCards.filter((c) => {
      if (c.rarity === 'Unknown' || c.rarity === '') return false
      return rarityFilter.includes(c.rarity)
    })
  }

  let totalProbability1_3 = 0
  let totalProbability4 = 0
  let totalProbability5 = 0
  for (const card of missingCards) {
    const rarity = card.rarity
    if (rarity === 'Unknown' || rarity === '') continue // Skip cards that cannot be picked

    const nrOfcardsOfThisRarity = cardsInPack.filter((c) => c.rarity === rarity).length
    // console.log('nr of cards of this rarity', rarity, nrOfcardsOfThisRarity) //nrOfcardsOfThisRarity = 25

    // the chance to get this card is the probability of getting this card in the pack divided by the number of cards of this rarity
    const chanceToGetThisCard1_3 = probabilityPerRarity1_3[rarity] / 100 / nrOfcardsOfThisRarity
    const chanceToGetThisCard4 = probabilityPerRarity4[rarity] / 100 / nrOfcardsOfThisRarity
    const chanceToGetThisCard5 = probabilityPerRarity5[rarity] / 100 / nrOfcardsOfThisRarity
    // console.log('chance to get this card', chanceToGetThisCard1_3) //0.02

    // add up the chances to get this card
    totalProbability1_3 += chanceToGetThisCard1_3
    totalProbability4 += chanceToGetThisCard4
    totalProbability5 += chanceToGetThisCard5
  }
  // console.log('totalProbability1_3', totalProbability1_3)
  // console.log('totalProbability4', totalProbability4)
  // console.log('totalProbability5', totalProbability5)

  // take the total probabilities per card draw (for the 1-3 you need to take the cube root of the probability) and multiply
  const chanceToGetNewCard = 1 - (1 - totalProbability1_3) ** 3 * (1 - totalProbability4) * (1 - totalProbability5)
  // console.log('chance to get new card', chanceToGetNewCard)

  return chanceToGetNewCard
}
