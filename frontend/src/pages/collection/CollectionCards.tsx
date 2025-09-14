import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel, { type Filters } from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import type { Card, CollectionRow } from '@/types'

interface Props {
  cards: CollectionRow[]
  isPublic: boolean
  extraOffset: number
  onSwitchToMissions?: () => void
}

export default function CollectionCards({ cards, isPublic, extraOffset, onSwitchToMissions }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [filteredCards, setFilteredCards] = useState<Card[] | null>(null)

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
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)

  useEffect(() => {
    setResetScrollTrigger(true)
    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)
    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <>
      <FilterPanel
        className="relative h-20 sm:h-fit"
        cards={cards}
        filters={filters}
        setFilters={setFilters}
        onFiltersChanged={(cards) => setFilteredCards(cards)}
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
        batchUpdate={!isPublic}
        share
      >
        {onSwitchToMissions && (
          <Button className="border absolute right-4 top-11 sm:top-0 cursor-pointer px-3" variant="ghost" onClick={onSwitchToMissions}>
            Go to missions
          </Button>
        )}
      </FilterPanel>
      {filteredCards && (
        <CardsTable
          cards={filteredCards}
          resetScrollTrigger={resetScrollTrigger}
          showStats={!filters.deckbuildingMode}
          extraOffset={extraOffset}
          editable={!filters.deckbuildingMode && !isPublic}
        />
      )}
    </>
  )
}
