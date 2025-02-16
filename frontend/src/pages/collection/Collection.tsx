import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { FiltersContext, FiltersContextDefaultState } from '@/lib/context/FiltersContext.ts'
import { use, useMemo } from 'react'
import { useImmer } from 'use-immer'
import { CardsTable } from './components/CardsTable.tsx'
import { isArtist, isCardType, isEvolutionStage, isEx, isExpansion, isMinimumHp, isOwned, isPack, isRarity, isSearch, isWeakness } from './filters.ts'

function Collection() {
  const { ownedCards } = use(CollectionContext)
  const [filterState, setFilterState] = useImmer(FiltersContextDefaultState)

  const filteredCards = useMemo(() => {
    /**
     * This filtering process is commutative (order-independent) but performance-sensitive.
     * Placing more restrictive filters first improves efficiency.
     * The implementation is O(n) and memory-efficient, avoiding intermediary arrays.
     */
    const filters = [
      isOwned(filterState.ownedFilterMode, ownedCards),
      isExpansion(filterState.expansionFilter),
      isRarity(filterState.rarityFilter),
      isSearch(filterState.searchValue),
      isMinimumHp(filterState.minimumHp),
      isCardType(filterState.cardTypeFilter),
      isEvolutionStage(filterState.evolutionStageFilter),
      isWeakness(filterState.weaknessFilter),
      isEx(filterState.exFilter),
      isPack(filterState.packFilter),
      isArtist(filterState.artistFilter),
    ]

    return allCards.filter((card) => filters.every((filter) => filter(card)))
  }, [filterState, ownedCards])

  return (
    <FiltersContext.Provider value={{ filterState, setFilterState }}>
      <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
        <div className="flex items-center gap-2 flex-col md:flex-row px-8">
          <SearchInput
            setSearchValue={(searchValue) =>
              setFilterState((draft) => {
                draft.searchValue = searchValue
              })
            }
          />
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
