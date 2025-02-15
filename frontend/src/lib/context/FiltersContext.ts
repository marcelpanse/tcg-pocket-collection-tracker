import type { Card, Rarity } from '@/types'
import { type Dispatch, type SetStateAction, createContext } from 'react'

type GetSet<TName extends string, TValue> = {
  [K in TName as `${K}`]: TValue
} & {
  [K in TName as `set${Capitalize<K>}`]: Dispatch<SetStateAction<TValue>>
}

export type FilterFn = Parameters<Array<Card>['filter']>[0]
export type OwnedFilterMode = 'all' | 'owned' | 'missing'
export type ExpansionSet = 'all' | (string & {})
export type RaritySet = 'all' | Set<Rarity>

type IFiltersContext = GetSet<'searchValue', string> &
  GetSet<'ownedFilterMode', OwnedFilterMode> &
  GetSet<'expansionFilter', ExpansionSet> &
  GetSet<'rarityFilter', RaritySet>

export const FiltersContext = createContext<IFiltersContext>({
  searchValue: '',
  setSearchValue: () => {},
  ownedFilterMode: 'all',
  setOwnedFilterMode: () => {},
  expansionFilter: 'all',
  setExpansionFilter: () => {},
  rarityFilter: 'all',
  setRarityFilter: () => {},
})
