import { useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel from '@/components/FiltersPanel'
import { type Filters, getFilteredCards } from '@/lib/filters'
import type { CollectionRow } from '@/types'

interface Props {
  cards: Map<number, CollectionRow>
  isPublic: boolean
  extraOffset: number
}

export default function CollectionCards({ cards, isPublic, extraOffset }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [filters, setFilters] = useState<Filters>({
    search: '',
    expansion: 'all',
    pack: 'all',
    cardType: [],
    rarity: [],
    owned: 'all',
    sortBy: 'expansion-newest',
    minNumber: 0,
    maxNumber: 100,
    deckbuildingMode: false,
    allTextSearch: false,
  })
  const filteredCards = useMemo(() => getFilteredCards(filters, cards), [filters, cards])

  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)

  useEffect(() => {
    setResetScrollTrigger(true)
    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)
    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <>
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        visibleFilters={{ expansions: !isMobile, allTextSearch: !isMobile, search: true, owned: !isMobile, rarity: !isMobile }}
        filtersDialog={{
          expansions: true,
          pack: true,
          search: true,
          owned: true,
          sortBy: true,
          rarity: true,
          cardType: true,
          amount: true,
          deckBuildingMode: true,
          allTextSearch: true,
        }}
        missionsButton={!isPublic}
        share
      />
      {filteredCards && (
        <CardsTable
          cards={filteredCards}
          resetScrollTrigger={resetScrollTrigger}
          showStats={!filters.deckbuildingMode}
          extraOffset={extraOffset}
          editable={!filters.deckbuildingMode && !isPublic}
          groupExpansions={filters.sortBy !== 'recent'}
        />
      )}
    </>
  )
}
