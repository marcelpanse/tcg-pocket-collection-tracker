import type { BooleanType, Rarity } from '@/types'
import { createContext } from 'react'
import type { Updater } from 'use-immer'

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

export const FiltersContext = createContext<{ filterState: FiltersState; setFilterState: Updater<FiltersState> }>({
  filterState: FiltersContextDefaultState,
  setFilterState: () => {},
})
