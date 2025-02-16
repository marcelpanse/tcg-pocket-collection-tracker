import type { ExpansionSet, OwnedFilterMode, RaritySet } from '@/lib/context/FiltersContext'
import type { BooleanType, Card, CollectionRow } from '@/types'

export type FilterFn = (value: Card) => boolean

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

export const isMinimumHp =
  (minimumHp: number): FilterFn =>
  (card) =>
    Number.isNaN(+card.hp) ? true : +card.hp >= minimumHp

export const isCardType =
  (cardTypes: string[]): FilterFn =>
  (card) =>
    cardTypes.length === 0 || cardTypes.includes(card.card_type)

export const isEvolutionStage =
  (evolutionStages: string[]): FilterFn =>
  (card) =>
    evolutionStages.length === 0 || evolutionStages.includes(card.evolution_type)

export const isWeakness =
  (weaknesses: string[]): FilterFn =>
  (card) =>
    weaknesses.length === 0 || weaknesses.includes(card.weakness)

export const isEx =
  (ex: 'all' | BooleanType): FilterFn =>
  (card) =>
    ex === 'all' || card.ex === ex

export const isPack =
  (pack: string[]): FilterFn =>
  (card) =>
    pack.length === 0 || pack.includes(card.pack)

export const isArtist =
  (artists: string[]): FilterFn =>
  (card) =>
    artists.length === 0 || artists.includes(card.artist)
