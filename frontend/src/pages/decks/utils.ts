import { getCardByInternalId } from '@/lib/CardsDB'
import type { Card, Collection } from '@/types'

export function getDeckCardCounts(cards: number[]) {
  const map = new Map<number, number>()
  for (const id of cards) {
    map.set(id, (map.get(id) ?? 0) + 1)
  }
  return [...map].toSorted(([a, _n1], [b, _n2]) => a - b)
}

function getDeckbuildingCopies(card: Card, ownedCards: Collection) {
  return card.alternate_versions.reduce((acc, id2) => acc + (ownedCards.get(id2)?.amount_owned ?? 0), 0)
}

export function getMissingCardsCount(cards: [number, number][], ownedCards: Collection) {
  return cards.reduce((acc, [id, amount]) => {
    const card = getCardByInternalId(id)
    if (!card) {
      console.error(`Unknown internal_id: ${id}`)
      return acc
    }
    return acc + Math.max(0, amount - getDeckbuildingCopies(card, ownedCards))
  }, 0)
}

export function getOwnedStatus(cards: number[], ownedCards: Collection) {
  const pastCopies = new Map<number, number>()
  cards.map(getCardByInternalId).filter(Boolean).toSorted()
  return cards.map((id) => {
    const card = getCardByInternalId(id)
    if (!card) {
      throw new Error(`Unknown internal_id: ${id}`)
    }
    id = card.alternate_versions[0]
    const curr = (pastCopies.get(id) ?? 0) + 1
    pastCopies.set(id, curr)
    return [id, curr <= getDeckbuildingCopies(card, ownedCards)] as [number, boolean]
  })
}
