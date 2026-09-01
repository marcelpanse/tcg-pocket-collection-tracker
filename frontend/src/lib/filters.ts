import i18n from '@/i18n'
import { type Card, type Collection, energies, expansionIds, type Rarity, type RaritySettingsRow } from '@/types'
import { allCards, getCardByInternalId } from './CardsDB'
import { levenshtein } from './levenshtein'
import { getCardNameByLang, getExtraCards, getNeededCards } from './utils'

export const expansionOptions = ['all', ...expansionIds] as const
export const sortByOptions = ['expansion-newest', 'rarity', 'type', 'recent'] as const
export const cardTypeOptions = [...energies, 'dragon', 'colorless'] as const
export const ownershipOptions = ['all', 'missing', 'registered'] as const
export const tradingOptions = ['all', 'wanted', 'extra'] as const
export const stageOptions = ['basic', 'stage1', 'stage2'] as const
export const pokemonKindOptions = ['regular', 'ex', 'megaex'] as const
export const trainerSubtypeOptions = ['item', 'supporter', 'tool', 'stadium'] as const
export const abilityOptions = ['all', 'yes', 'no'] as const
export const hpOptions: readonly number[] = [...new Set([0, ...allCards.map((c) => c.hp).filter((v): v is number => v !== undefined)])].sort((a, b) => a - b)
export const retreatOptions: readonly number[] = [...new Set([0, ...allCards.map((c) => c.retreat).filter((v): v is number => v !== undefined)])].sort(
  (a, b) => a - b,
)
export type ExpansionOption = (typeof expansionOptions)[number]
export type SortByOption = (typeof sortByOptions)[number]
export type CardTypeOption = (typeof cardTypeOptions)[number]
export type OwnershipOptions = (typeof ownershipOptions)[number]
export type TradingOption = (typeof tradingOptions)[number]
export type StageOption = (typeof stageOptions)[number]
export type PokemonKindOption = (typeof pokemonKindOptions)[number]
export type TrainerSubtypeOption = (typeof trainerSubtypeOptions)[number]
export type AbilityOption = (typeof abilityOptions)[number]

export interface FiltersAll {
  search: string
  expansion: ExpansionOption
  pack: string
  cardType: CardTypeOption[]
  rarity: Rarity[]
  ownership: OwnershipOptions
  trading: TradingOption
  sortBy: SortByOption
  sortDesc: boolean
  minNumber: number
  maxNumber: number | '∞'
  deckbuildingMode: boolean
  allTextSearch: boolean
  stage: StageOption[]
  pokemonKind: PokemonKindOption[]
  trainerSubtype: TrainerSubtypeOption[]
  ability: AbilityOption
  minHp: number
  maxHp: number | '∞'
  minRetreat: number
  maxRetreat: number | '∞'
}
export type Filters = Partial<FiltersAll>

const sortComparators: Record<SortByOption, (a: Card, b: Card) => number> = {
  'expansion-newest': (a, b) => {
    if (a.expansion !== b.expansion) {
      return expansionIds.indexOf(a.expansion) - expansionIds.indexOf(b.expansion)
    }
    return a.card_id.localeCompare(b.card_id, i18n.language || 'en', { numeric: true })
  },
  rarity: (a, b) => (a.internal_id & 63) - (b.internal_id & 63),
  type: (a, b) => (cardTypeOptions as readonly string[]).indexOf(a.energy) - (cardTypeOptions as readonly string[]).indexOf(b.energy),
  recent: (a, b) => {
    if (a.updated_at && b.updated_at) {
      return b.updated_at.getTime() - a.updated_at.getTime()
    } else if (a.updated_at && !b.updated_at) {
      return -1
    } else {
      return 1
    }
  },
}

export function getFilteredCards(filters: Filters, cards: Collection, tradingSettings?: RaritySettingsRow[]) {
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

  if (filters.rarity !== undefined && filters.rarity.length > 0) {
    const rarity = filters.rarity
    filteredCards = filteredCards.filter((c) => rarity.includes(c.rarity))
  }
  const cardTypeSelected = filters.cardType !== undefined && filters.cardType.length > 0
  const trainerSubtypeSelected = filters.trainerSubtype !== undefined && filters.trainerSubtype.length > 0
  if (cardTypeSelected || trainerSubtypeSelected) {
    const cardType = filters.cardType ?? []
    const trainerSubtype = filters.trainerSubtype ?? []
    filteredCards = filteredCards.filter((c) =>
      c.card_type === 'trainer' ? trainerSubtype.includes(c.evolution_type as TrainerSubtypeOption) : cardType.includes(c.energy as CardTypeOption),
    )
  }
  if (filters.stage !== undefined && filters.stage.length > 0) {
    const stage = filters.stage
    filteredCards = filteredCards.filter((c) => c.card_type === 'pokémon' && stage.includes(c.evolution_type as StageOption))
  }
  if (filters.pokemonKind !== undefined && filters.pokemonKind.length > 0) {
    const kinds = filters.pokemonKind
    filteredCards = filteredCards.filter((c) => {
      if (c.card_type !== 'pokémon') {
        return false
      }
      const isMega = c.name.startsWith('Mega ')
      const kind: PokemonKindOption = c.ex ? (isMega ? 'megaex' : 'ex') : 'regular'
      return kinds.includes(kind)
    })
  }
  if (filters.ability !== undefined && filters.ability !== 'all') {
    const wantAbility = filters.ability === 'yes'
    filteredCards = filteredCards.filter((c) => Boolean(c.ability?.name || c.ability?.effect) === wantAbility)
  }
  if (filters.minHp !== undefined && filters.minHp > 0) {
    const minHp = filters.minHp
    filteredCards = filteredCards.filter((c) => (c.hp ?? 0) >= minHp)
  }
  if (filters.maxHp !== undefined && filters.maxHp !== '∞') {
    const maxHp = filters.maxHp
    filteredCards = filteredCards.filter((c) => (c.hp ?? 0) <= maxHp)
  }
  if (filters.minRetreat !== undefined && filters.minRetreat > 0) {
    const minRetreat = filters.minRetreat
    filteredCards = filteredCards.filter((c) => c.card_type === 'pokémon' && (c.retreat ?? 0) >= minRetreat)
  }
  if (filters.maxRetreat !== undefined && filters.maxRetreat !== '∞') {
    const maxRetreat = filters.maxRetreat
    filteredCards = filteredCards.filter((c) => c.card_type !== 'pokémon' || (c.retreat ?? 0) <= maxRetreat)
  }

  if (filters.search) {
    filteredCards = filteredCards.filter(searchPredicate(filters.search, filters.allTextSearch))
  }

  // Fill up `collected` and `updated at`
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
    card.collected = ownedCard?.collected ?? false
    card.updated_at = ownedCard?.updated_at
  }

  if (filters.minNumber !== undefined) {
    const minNumber = filters.minNumber
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) >= minNumber)
  }
  if (filters.maxNumber !== undefined && filters.maxNumber !== '∞') {
    const maxNumber = filters.maxNumber
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) <= maxNumber)
  }

  if (filters.sortBy !== undefined) {
    filteredCards.sort(sortComparators[filters.sortBy])
  }
  if (filters.sortDesc) {
    filteredCards.reverse()
  }

  return filteredCards
}

export function searchPredicate(search: string, allTextSearch?: boolean) {
  const query = search.toLowerCase()
  const threshold = 2 // tweak if needed
  return (card: Card) => {
    const name = getCardNameByLang(card, i18n.language).toLowerCase()

    let filterAllText = false
    if (allTextSearch) {
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
  }
}
