import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { type ExpansionSet, FiltersContext, type OwnedFilterMode, type RaritySet } from '@/lib/context/FiltersContext.ts'
import { use, useCallback, useMemo, useState } from 'react'
import { CardsTable } from './components/CardsTable.tsx'
import { isExpansion, isOwned, isRarity, isSearch } from './filters.ts'

function Collection() {
  const { ownedCards } = use(CollectionContext)

  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<ExpansionSet>('all')
  const [rarityFilter, setRarityFilter] = useState<RaritySet>('all')
  const [ownedFilterMode, setOwnedFilterMode] = useState<OwnedFilterMode>('all')

  const isOwnedFilter = useCallback(isOwned(ownedFilterMode, ownedCards), [ownedFilterMode, ownedCards])
  const isExpansionFilter = useCallback(isExpansion(expansionFilter), [expansionFilter])
  const isSearchFilter = useCallback(isSearch(searchValue), [searchValue])
  const isRarityFilter = useCallback(isRarity(rarityFilter), [rarityFilter])

  const filteredCards = useMemo(() => {
    //! This filtering process is "commutative": order of filters doesn't affect the final result.
    //! However, performance is "order-dependent": placing restrictive filters first improves efficiency.
    // biome-ignore format: More readable over multiple lines
    const filters = [
        isOwnedFilter,
        isExpansionFilter,
        isRarityFilter,
        isSearchFilter,
      ]

    //! This is O(n) because it is a single loop and reduce memory usage because it doesn't use
    //! intermediary arrays.
    return filters.reduce((acc, filter) => acc.filter(filter), allCards)
  }, [isOwnedFilter, isRarityFilter, isExpansionFilter, isSearchFilter])

  return (
    <FiltersContext.Provider
      value={{ searchValue, setSearchValue, expansionFilter, setExpansionFilter, rarityFilter, setRarityFilter, ownedFilterMode, setOwnedFilterMode }}
    >
      <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
        <div className="flex items-center gap-2 flex-col md:flex-row px-8">
          <SearchInput setSearchValue={setSearchValue} />
          <ExpansionsFilter />
        </div>
        <div className="flex items-center justify-between gap-2 flex-col md:flex-row px-8 pb-8">
          <OwnedFilter />
          <RarityFilter />
        </div>
        <CardsTable cards={filteredCards} />
      </div>
    </FiltersContext.Provider>
  )
}

export default Collection
