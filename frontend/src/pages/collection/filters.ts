import type { ExpansionSet, FilterFn, OwnedFilterMode, RaritySet } from '@/lib/context/FiltersContext'
import type { CollectionRow } from '@/types'

export const isOwned =
  (mode: OwnedFilterMode, ownedCards: CollectionRow[]): FilterFn =>
  (card) =>
    mode === 'all'
      ? true
      : mode === 'owned'
        ? ownedCards.some((oc) => card.card_id === oc.card_id && oc.amount_owned > 0)
        : !ownedCards.some((oc) => card.card_id === oc.card_id)

export const isExpansion =
  (expansion: ExpansionSet): FilterFn =>
  (card) =>
    expansion === 'all' || card.expansion === expansion

export const isSearch =
  (search: string): FilterFn =>
  (card) =>
    card.name.toLowerCase().includes(search.toLowerCase()) || card.card_id.toLowerCase().includes(search.toLowerCase())

export const isRarity =
  (rarity: RaritySet): FilterFn =>
  (card) => {
    if (typeof rarity === 'string' && rarity === 'all') return true
    if (typeof rarity === 'string' && rarity !== 'all') {
      console.warn('Invalid rarity filter:', rarity)
      return true // Don't filter as a fallback
    }
    return rarity.has(card.rarity)
  }
