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
  return cards
    .map(getCardByInternalId)
    .filter((c): c is Card => c !== undefined)
    .toSorted(cmp)
    .map((card) => {
      const id = card.alternate_versions[0]
      const curr = (pastCopies.get(id) ?? 0) + 1
      pastCopies.set(id, curr)
      return [id, curr <= getDeckbuildingCopies(card, ownedCards)] as [number, boolean]
    })
}

function sortRank(card: Card) {
  return card.card_type === 'pokémon'
    ? 0
    : card.evolution_type === 'item'
      ? 1
      : card.evolution_type === 'tool'
        ? 2
        : card.evolution_type === 'supporter'
          ? 3
          : card.evolution_type === 'stadium'
            ? 4
            : 5
}

function cmp(a: Card, b: Card) {
  const ar = sortRank(a)
  const br = sortRank(b)
  return ar === br ? a.internal_id - b.internal_id : ar - br
}
