import i18n from '@/i18n'
import { type CollectionRow, cardTypes, expansionIds, type Rarity, type RaritySettingsRow } from '@/types'
import { allCards, getCardByInternalId } from './CardsDB'
import { levenshtein } from './levenshtein'
import { getCardNameByLang, getExtraCards, getNeededCards } from './utils'

export const expansionOptions = ['all', ...expansionIds] as const
export const sortByOptions = ['default', 'recent', 'expansion-newest'] as const
export const cardTypeOptions = cardTypes
export const ownershipOptions = ['all', 'missing', 'registered'] as const
export const tradingOptions = ['all', 'wanted', 'extra'] as const
export type ExpansionOption = (typeof expansionOptions)[number]
export type SortByOption = (typeof sortByOptions)[number]
export type CardTypeOption = (typeof cardTypeOptions)[number]
export type OwnershipOptions = (typeof ownershipOptions)[number]
export type TradingOption = (typeof tradingOptions)[number]

export interface FiltersAll {
  search: string
  expansion: ExpansionOption
  pack: string
  cardType: CardTypeOption[]
  rarity: Rarity[]
  ownership: OwnershipOptions
  trading: TradingOption
  sortBy: SortByOption
  minNumber: number
  maxNumber: number
  deckbuildingMode: boolean
  allTextSearch: boolean
}
export type Filters = Partial<FiltersAll>

export function getFilteredCards(filters: Filters, cards: Map<number, CollectionRow>, tradingSettings?: RaritySettingsRow[]) {
  let filteredCards = allCards

  if (filters.deckbuildingMode) {
    filteredCards = filteredCards.filter((c) => c.internal_id === c.alternate_versions[0])
  }

  if (filters.expansion !== undefined && filters.expansion !== 'all') {
    filteredCards = filteredCards.filter((card) => card.expansion === filters.expansion)
  }
  if (filters.expansion !== undefined && filters.pack !== undefined && filters.pack !== 'all') {
    filteredCards = filteredCards.filter((card) => card.pack === filters.pack || card.pack === 'everypack')
  }
  if (filters.ownership !== undefined && filters.ownership !== 'all') {
    filteredCards = filteredCards.filter((card) => (filters.ownership === 'missing' ? !card.collected : card.collected))
  }
  if (filters.trading !== undefined && filters.trading !== 'all') {
    if (!tradingSettings) {
      throw new Error('Cannot filter by trading status without trading settings')
    }
    const filtered = new Set(filters.trading === 'wanted' ? getNeededCards(cards, tradingSettings) : getExtraCards(cards, tradingSettings))
    filteredCards = filteredCards.filter((card) => filtered.has(card.internal_id))
  }

  if (filters.sortBy !== undefined) {
    if (filters.sortBy === 'recent') {
      filteredCards = filteredCards.toSorted((a, b) => {
        const isUpdatedA = cards.get(a.internal_id)?.updated_at
        const isUpdatedB = cards.get(b.internal_id)?.updated_at
        if (isUpdatedA && isUpdatedB) {
          return new Date(isUpdatedB).getTime() - new Date(isUpdatedA).getTime()
        } else if (isUpdatedA && !isUpdatedB) {
          return -1
        } else {
          return 1
        }
      })
    } else if (filters.sortBy === 'expansion-newest') {
      filteredCards = [...filteredCards].sort((a, b) => {
        if (a.expansion !== b.expansion) {
          return expansionIds.indexOf(a.expansion) - expansionIds.indexOf(b.expansion)
        }
        return a.card_id.localeCompare(b.card_id, i18n.language || 'en', { numeric: true })
      })
    }
  }

  filteredCards = filteredCards.filter((c) => {
    if (filters.rarity === undefined || filters.rarity.length === 0) {
      return true
    }
    return filters.rarity.includes(c.rarity)
  })
  filteredCards = filteredCards.filter((c) => {
    if (filters.cardType === undefined || filters.cardType.length === 0) {
      return true
    }
    if (c.card_type.toLowerCase() === 'trainer') {
      return filters.cardType.includes('trainer')
    }
    return filters.cardType.includes(c.energy.toLowerCase() as CardTypeOption)
  })

  if (filters.search) {
    const query = filters.search.toLowerCase()
    const threshold = 2 // tweak if needed

    filteredCards = filteredCards.filter((card) => {
      const name = getCardNameByLang(card, i18n.language).toLowerCase()

      let filterAllText = false
      if (filters.allTextSearch) {
        filterAllText =
          (card.ability && (card.ability.name.toLowerCase().includes(query) || card.ability.effect.toLowerCase().includes(query))) ||
          card.attacks.some(
            (attack) =>
              attack.name?.toLowerCase().includes(query) || (attack.effect?.toLowerCase() !== 'no effect' && attack.effect?.toLowerCase()?.includes(query)),
          )
      }
      const isExactMatch = name.includes(query)
      const isFuzzyMatch = levenshtein(name, query) <= threshold
      const isIdMatch = card.card_id.toLowerCase().includes(query)

      return filterAllText || isExactMatch || isFuzzyMatch || isIdMatch
    })
  }

  for (const card of filteredCards) {
    if (filters.deckbuildingMode) {
      card.amount_owned = card.alternate_versions.reduce((acc, c) => {
        const card = getCardByInternalId(c)
        return acc + (cards.get(card?.internal_id || 0)?.amount_owned ?? 0)
      }, 0)
    } else {
      card.amount_owned = cards.get(card.internal_id)?.amount_owned ?? 0
    }

    const ownedCard = cards.get(card.internal_id)
    card.collected = ownedCard?.collection.includes(card.card_id) ?? false
    card.updated_at = ownedCard?.updated_at
  }
  if (filters.minNumber !== undefined) {
    const minNumber = filters.minNumber
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) >= minNumber)
  }
  if (filters.maxNumber !== undefined && filters.maxNumber !== 100) {
    const maxNumber = filters.maxNumber
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) <= maxNumber)
  }

  return filteredCards
}
