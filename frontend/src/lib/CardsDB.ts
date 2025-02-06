import type { Card, CollectionRow, Expansion } from '@/types'
import A1 from '../../assets/cards/A1.json'
import A1a from '../../assets/cards/A1a.json'
import A2 from '../../assets/cards/A2.json'
import PA from '../../assets/cards/P-A.json'

const update = (cards: Card[], expansionName: string) => {
  for (const card of cards) {
    // @ts-ignore there is an ID in the JSON, but I don't want it in the Type because you should always use the card_id, having both is confusing.
    card.card_id = `${expansionName}-${card.id}`
    card.expansion = expansionName
  }
  return cards
}

export const a1Cards: Card[] = update(A1 as unknown as Card[], 'A1')
export const a2Cards: Card[] = update(A2 as unknown as Card[], 'A2')
export const a1aCards: Card[] = update(A1a as unknown as Card[], 'A1a')
export const paCards: Card[] = update(PA as unknown as Card[], 'P-A')
export const allCards: Card[] = [...a1Cards, ...a2Cards, ...a1aCards, ...paCards]

export const expansions: Expansion[] = [
  {
    name: 'Genetic Apex',
    id: 'A1',
    cards: a1Cards,
    packs: ['Mewtwo pack', 'Charizard pack', 'Pikachu pack', 'Every pack'],
  },
  {
    name: 'Mythical Island',
    id: 'A1a',
    cards: a1aCards,
    packs: ['Mew pack'],
  },
  {
    name: 'Space-Time Smackdown',
    id: 'A2',
    cards: a2Cards,
    packs: ['Dialka pack', 'Palkia pack', 'Every pack'],
  },
  {
    name: 'Promo-A',
    id: 'PA',
    cards: paCards,
    packs: ['Every pack'],
  },
]

export const nrOfCardsOwned = (ownedCards: CollectionRow[], expansion: Expansion, pack?: string) => {
  return ownedCards.filter((oc) => {
    if (pack) {
      return expansion.cards.find((c) => c.pack === pack && c.card_id === oc.card_id && oc.amount_owned > 0)
    }
    return expansion.cards.find((c) => c.card_id === oc.card_id && oc.amount_owned > 0)
  }).length
}

export const totalNrOfCards = (expansion?: Expansion, pack?: string) => {
  if (!expansion) {
    return allCards.length
  }
  if (!pack) {
    return expansion.cards.length
  }
  return expansion.cards.filter((c) => c.pack === pack).length
}
