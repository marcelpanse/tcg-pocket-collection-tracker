import { ChevronFirst, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { DropdownFilter, TabsFilter, ToggleFilter } from '@/components/Filters'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { showCardType } from '@/components/utils'
import { capitalize } from '@/lib/utils'
import { type DeckFilters, deckKinds, deckOrder } from '@/services/decks/deckService'
import { useDecksSearch } from '@/services/decks/useDeck'
import { energies } from '@/types'
import { DeckItem } from './DeckItem'

export default function Decks() {
  const navigate = useNavigate()
  const { kind } = useParams<{ kind: DeckFilters['kind'] }>()
  const validKind = kind && deckKinds.includes(kind) ? kind : 'community'

  const [filters, setFilters] = useState<DeckFilters>({ kind: validKind, orderby: 'popular', page: 0, energy: [] })
  const { data, isLoading, isError, error } = useDecksSearch(filters)

  const handleKindChange = (newKind: DeckFilters['kind']) => {
    setFilters((prev) => ({ ...prev, kind: newKind, page: 0 }))
    navigate(`/decks/filter/${newKind}`, { replace: true })
  }

  return (
    <div className="flex gap-4 flex-col sm:flex-row sm:w-fit mx-auto px-1">
      <div className="flex flex-col gap-2">
        <Link to="/decks/edit">
          <Button className="w-full">
            New deck
            <ChevronRight />
          </Button>
        </Link>
        <TabsFilter className="w-full" options={deckKinds} value={filters.kind} onChange={handleKindChange} show={(kind) => `${capitalize(kind)} decks`} />
        {filters.kind === 'community' && (
          <DropdownFilter
            options={deckOrder}
            value={filters.orderby}
            onChange={(orderby) => setFilters((prev) => ({ ...prev, orderby }))}
            label="Sort by"
            show={capitalize}
          />
        )}
        <ToggleFilter options={energies} value={filters.energy} onChange={(energy) => setFilters((prev) => ({ ...prev, energy }))} show={showCardType} />
      </div>
      <div className="flex flex-col gap-2 sm:w-xl">
        <div className="flex items-center gap-2">
          <span>Page {filters.page + 1}</span>
          <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, page: 0 }))} disabled={filters.page <= 0}>
            <ChevronFirst />
          </Button>
          <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))} disabled={filters.page <= 0}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={!data?.hasNext}>
            <ChevronRight />
          </Button>
          {data && <p className="italic text-neutral-400">Found {data.count} decks</p>}
        </div>
        {isLoading ? (
          <Spinner size="md" overlay />
        ) : isError || !data ? (
          <ErrorAlert error={error ?? undefined} />
        ) : (
          data.decks.map((deck) => <DeckItem key={deck.id} deck={deck} />)
        )}
      </div>
    </div>
  )
}
