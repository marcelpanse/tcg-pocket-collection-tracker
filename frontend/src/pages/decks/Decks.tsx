import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { TabsFilter } from '@/components/Filters'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { type DeckFilters, deckKinds } from '@/services/decks/deckService'
import { useDecksSearch } from '@/services/decks/useDeck'
import { DeckItem } from './DeckItem'

export const rankOrder: Record<string, number> = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  'A+': 4,
  S: 5,
}

export default function Decks() {
  const [filters, setFilters] = useState<DeckFilters>({ kind: 'my', page: 0 })
  const { data, isLoading, isError, error } = useDecksSearch(filters)

  return (
    <div className="flex flex-col gap-2 mx-auto max-w-[900px] px-1">
      <Link to="/decks/edit" className="inline-block sm:max-w-48 ml-auto">
        <Button className="w-full">
          New deck
          <ChevronRight />
        </Button>
      </Link>
      <TabsFilter
        options={deckKinds}
        value={filters.kind}
        onChange={(x) => setFilters((prev) => ({ ...prev, kind: x }))}
        show={(kind) => `${kind.charAt(0).toUpperCase() + kind.slice(1)} decks`}
      />
      <div className="flex items-center gap-2">
        <span>Page {filters.page + 1}</span>
        <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))} disabled={filters.page <= 0}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={data?.length === 0}>
          <ChevronRight />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <Spinner size="md" overlay />
        ) : isError || !data ? (
          <ErrorAlert error={error ?? undefined} />
        ) : data.length === 0 ? (
          'Nothing to show'
        ) : (
          data.map((deck) => <DeckItem key={deck.id} deck={deck} />)
        )}
      </div>
    </div>
  )
}
