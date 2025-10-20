import i18n from '@/i18n'
import { type CollectionRow, cardTypes, expansionIds, type Rarity } from '@/types'
import { allCards, basicRarities, expansions, getCardById } from './CardsDB'
import { levenshtein } from './levenshtein'
import { getCardNameByLang } from './utils'

export const ownedOptions = ['all', 'missing', 'owned'] as const
export const expansionOptions = ['all', ...expansionIds] as const
export const sortByOptions = ['default', 'recent', 'expansion-newest'] as const
export const cardTypeOptions = [...cardTypes.filter((x) => x !== '')] as const
export type OwnedOption = (typeof ownedOptions)[number]
export type ExpansionOption = (typeof expansionOptions)[number]
export type SortByOption = (typeof sortByOptions)[number]
export type CardTypeOption = (typeof cardTypeOptions)[number]

export interface Filters {
  search: string
  expansion: ExpansionOption
  pack: string
  cardType: CardTypeOption[]
  rarity: Rarity[]
  owned: OwnedOption
  sortBy: SortByOption
  minNumber: number
  maxNumber: number
  deckbuildingMode: boolean
  allTextSearch: boolean
}

export function getFilteredCards(filters: Filters, cards: Map<number, CollectionRow>) {
  let filteredCards = allCards

  if (filters.deckbuildingMode) {
    filteredCards = filteredCards.filter((c) => basicRarities.includes(c.rarity) || c.rarity === 'P')
  }

  if (filters.expansion !== 'all') {
    filteredCards = filteredCards.filter((card) => card.expansion === filters.expansion)
  }
  if (filters.pack !== 'all') {
    filteredCards = filteredCards.filter((card) => card.pack === filters.pack || card.pack === 'everypack')
  }
  if (filters.owned !== 'all') {
    if (filters.owned === 'owned') {
      filteredCards = filteredCards.filter((card) => card.collected)
    } else if (filters.owned === 'missing') {
      filteredCards = filteredCards.filter((card) => !card.collected)
    }
  }

  if (filters.sortBy === 'recent') {
    filteredCards = [...filteredCards].sort((a, b) => {
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
    const reversedExpansions = [...expansions].reverse()

    filteredCards = [...filteredCards].sort((a, b) => {
      const expansionIndexA = reversedExpansions.findIndex((e) => e.id === a.expansion)
      const expansionIndexB = reversedExpansions.findIndex((e) => e.id === b.expansion)

      if (expansionIndexA !== expansionIndexB) {
        return expansionIndexA - expansionIndexB
      }

      return a.card_id.localeCompare(b.card_id, i18n.language || 'en', { numeric: true })
    })
  }

  filteredCards = filteredCards.filter((c) => {
    if (filters.rarity.length === 0) {
      return true
    }
    return filters.rarity.includes(c.rarity)
  })
  filteredCards = filteredCards.filter((c) => {
    if (filters.cardType.length === 0) {
      return true
    }
    if (c.card_type.toLowerCase() === 'trainer') {
      return filters.cardType.includes('trainer')
    }
    return c.energy !== '' && filters.cardType.includes(c.energy.toLowerCase() as CardTypeOption)
  })

  if (filters.search) {
    const threshold = 2 // tweak if needed

    filteredCards = filteredCards.filter((card) => {
      const name = getCardNameByLang(card, i18n.language).toLowerCase()
      const query = filters.search.toLowerCase()

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
        const card = getCardById(c)
        return acc + (cards.get(card?.internal_id || 0)?.amount_owned ?? 0)
      }, 0)
    } else {
      card.amount_owned = cards.get(card.internal_id)?.amount_owned ?? 0
    }
    card.collected = cards.get(card.internal_id)?.collection.includes(card.card_id) ?? false
  }
  filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) >= filters.minNumber)
  if (filters.maxNumber !== 100) {
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) <= filters.maxNumber)
  }

  return filteredCards
}
