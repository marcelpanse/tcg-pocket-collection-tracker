import type { BooleanType, Rarity } from '@/types'
import { type Dispatch, createContext, useReducer } from 'react'

export type OwnedFilterMode = 'all' | 'owned' | 'missing'
export type ExpansionSet = 'all' | (string & {})
export type RaritySet = 'all' | Set<Rarity>

export type FiltersState = {
  searchValue: string
  ownedFilterMode: OwnedFilterMode
  expansionFilter: ExpansionSet
  rarityFilter: RaritySet
  minimumHp: number
  cardTypeFilter: string[]
  evolutionStageFilter: string[]
  weaknessFilter: string[]
  exFilter: 'all' | BooleanType
  packFilter: string[]
  artistFilter: string[]
}

export type FiltersAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_OWNED_FILTER'; payload: OwnedFilterMode }
  | { type: 'SET_EXPANSION_FILTER'; payload: ExpansionSet }
  | { type: 'SET_RARITY_FILTER'; payload: RaritySet }
  | { type: 'SET_MINIMUM_HP'; payload: number }
  | { type: 'SET_CARD_TYPE_FILTER'; payload: string[] }
  | { type: 'SET_EVOLUTION_STAGE_FILTER'; payload: string[] }
  | { type: 'SET_WEAKNESS_FILTER'; payload: string[] }
  | { type: 'SET_EX_FILTER'; payload: 'all' | BooleanType }
  | { type: 'SET_PACK_FILTER'; payload: string[] }
  | { type: 'SET_ARTIST_FILTER'; payload: string[] }

export const filtersReducer = (state: FiltersState, action: FiltersAction): FiltersState => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchValue: action.payload }
    case 'SET_OWNED_FILTER':
      return { ...state, ownedFilterMode: action.payload }
    case 'SET_EXPANSION_FILTER':
      return { ...state, expansionFilter: action.payload }
    case 'SET_RARITY_FILTER':
      return { ...state, rarityFilter: action.payload }
    case 'SET_MINIMUM_HP':
      return { ...state, minimumHp: action.payload }
    case 'SET_CARD_TYPE_FILTER':
      return { ...state, cardTypeFilter: action.payload }
    case 'SET_EVOLUTION_STAGE_FILTER':
      return { ...state, evolutionStageFilter: action.payload }
    case 'SET_WEAKNESS_FILTER':
      return { ...state, weaknessFilter: action.payload }
    case 'SET_EX_FILTER':
      return { ...state, exFilter: action.payload }
    case 'SET_PACK_FILTER':
      return { ...state, packFilter: action.payload }
    case 'SET_ARTIST_FILTER':
      return { ...state, artistFilter: action.payload }
    default:
      return state
  }
}

export const FiltersContextDefaultState: FiltersState = {
  searchValue: '',
  ownedFilterMode: 'all',
  expansionFilter: 'all',
  rarityFilter: 'all',
  minimumHp: 0,
  cardTypeFilter: [],
  evolutionStageFilter: [],
  weaknessFilter: [],
  exFilter: 'all',
  packFilter: [],
  artistFilter: [],
}

export const useFilters = () => useReducer(filtersReducer, FiltersContextDefaultState)

export const FiltersContext = createContext<{ state: FiltersState; dispatch: Dispatch<FiltersAction> }>({
  state: FiltersContextDefaultState,
  dispatch: () => {},
})
