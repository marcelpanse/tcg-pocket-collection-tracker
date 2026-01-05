import { getCardByInternalId } from '@/lib/CardsDB'
import type { CollectionRow } from '@/types'

export function getDeckCardCounts(cards: number[]) {
  const map = new Map<number, number>()
  for (const id of cards) {
    map.set(id, (map.get(id) ?? 0) + 1)
  }
  return [...map].toSorted(([a, _n1], [b, _n2]) => a - b)
}

export function getMissingCardsCount(cards: [number, number][], ownedCards: Map<number, CollectionRow>) {
  return cards.reduce(
    (acc, [id, amount]) =>
      acc + Math.max(0, amount - (getCardByInternalId(id)?.alternate_versions?.reduce((acc2, id2) => acc2 + (ownedCards.get(id2)?.amount_owned ?? 0), 0) ?? 0)),
    0,
  )
}
