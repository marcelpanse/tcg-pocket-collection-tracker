import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { FiltersContext, useFilters } from '@/lib/context/FiltersContext.ts'
import { use, useDeferredValue, useMemo } from 'react'
import { CardsTable } from './components/CardsTable.tsx'
import { isArtist, isCardType, isEvolutionStage, isEx, isExpansion, isMinimumHp, isOwned, isPack, isRarity, isSearch, isWeakness } from './filters.ts'

function Collection() {
  const { ownedCards } = use(CollectionContext)
  const [state, dispatch] = useFilters()

  /**
   * Apply deferred value to reduce UI flickering during rapid filter changes.
   * The table contains a large number of cards, and quick filtering adjustments
   * can cause visual instability. By introducing a slight delay here, we ensure
   * a smoother user experience when interacting with the filters.
   */
  const deferredState = useDeferredValue(state)

  const filteredCards = useMemo(() => {
    /**
     * This filtering process is commutative (order-independent) but performance-sensitive.
     * Placing more restrictive filters first improves efficiency.
     * The implementation is O(n) and memory-efficient, avoiding intermediary arrays.
     */
    const filters = [
      isOwned(deferredState.ownedFilterMode, ownedCards),
      isExpansion(deferredState.expansionFilter),
      isRarity(deferredState.rarityFilter),
      isSearch(deferredState.searchValue),
      isMinimumHp(deferredState.minimumHp),
      isCardType(deferredState.cardTypeFilter),
      isEvolutionStage(deferredState.evolutionStageFilter),
      isWeakness(deferredState.weaknessFilter),
      isEx(deferredState.exFilter),
      isPack(deferredState.packFilter),
      isArtist(deferredState.artistFilter),
    ]

    return allCards.filter((card) => filters.every((filter) => filter(card)))
  }, [deferredState, ownedCards])

  return (
    <FiltersContext.Provider value={{ state: deferredState, dispatch }}>
      <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
        <div className="flex items-center gap-2 flex-col md:flex-row px-8">
          <SearchInput setSearchValue={(searchValue) => dispatch({ type: 'SET_SEARCH', payload: searchValue })} />
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
