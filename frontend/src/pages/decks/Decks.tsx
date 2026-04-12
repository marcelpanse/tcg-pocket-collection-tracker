import { ChevronFirst, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import ErrorAlert from '@/components/ErrorAlert'
import { DropdownFilter, TabsFilter, ToggleFilter } from '@/components/Filters'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { showCardType } from '@/components/utils'
import useSearchState from '@/hooks/use-search-state'
import { capitalize } from '@/lib/utils'
import { deckKinds, deckOrder } from '@/services/decks/deckService'
import { useDecksSearch } from '@/services/decks/useDeck'
import { energies } from '@/types'
import { DeckItem } from './DeckItem'

const schema = z.object({
  from: z.enum(deckKinds).default('community'),
  orderby: z.enum(deckOrder).default('popular'),
  page: z.number().gte(0).default(0),
  energy: z.array(z.enum(energies)).default([]),
})

export default function Decks() {
  const [filters, setFilters] = useSearchState(schema)
  const { data, isLoading, isError, error } = useDecksSearch(filters)

  return (
    <div className="flex gap-4 flex-col sm:flex-row sm:w-fit mx-auto px-1">
      <div className="flex flex-col gap-2">
        <Link to="/decks/edit">
          <Button className="w-full">
            New deck
            <ChevronRight />
          </Button>
        </Link>
        <TabsFilter
          className="w-full"
          options={deckKinds}
          value={filters.from}
          onChange={(from) => setFilters({ from })}
          show={(from) => `${capitalize(from)} decks`}
        />
        {filters.from === 'community' && (
          <DropdownFilter options={deckOrder} value={filters.orderby} onChange={(orderby) => setFilters({ orderby })} label="Sort by" show={capitalize} />
        )}
        <ToggleFilter options={energies} value={filters.energy} onChange={(energy) => setFilters({ energy })} show={showCardType} />
      </div>
      <div className="flex flex-col gap-2 sm:w-xl">
        <div className="flex items-center gap-2">
          <span>Page {filters.page + 1}</span>
          <Button variant="outline" onClick={() => setFilters({ page: 0 })} disabled={filters.page <= 0}>
            <ChevronFirst />
          </Button>
          <Button variant="outline" onClick={() => setFilters({ page: Math.max(filters.page - 1, 0) })} disabled={filters.page <= 0}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setFilters({ page: filters.page + 1 })} disabled={!data?.hasNext}>
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
