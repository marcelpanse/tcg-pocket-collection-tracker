import { Trash2 } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useSearchParams } from 'react-router'
import { CardsTable } from '@/components/CardsTable.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  type CardTypeOption,
  cardTypeOptions,
  expansionOptions,
  type Filters,
  type FiltersAll,
  getFilteredCards,
  ownedOptions,
  sortByOptions,
} from '@/lib/filters'
import { type CollectionRow, type Rarity, rarities } from '@/types'
import CollectionFiltersPanel from './FiltersPanel'

const numberParser = (s: string) => {
  const x = Number(s)
  return Number.isNaN(x) ? undefined : x
}
const boolParser = (s: string) => {
  return s === 'true' ? true : s === 'false' ? false : undefined
}

const filterParsers: { [K in keyof FiltersAll]: (s: string) => Filters[K] | undefined } = {
  search: (s) => s,
  expansion: (s) => ((expansionOptions as readonly string[]).includes(s) ? (s as Filters['expansion']) : undefined),
  pack: (s) => s,
  cardType: (s) => s.split(',').filter((x): x is CardTypeOption => (cardTypeOptions as readonly string[]).includes(x)),
  rarity: (s) => s.split(',').filter((x): x is Rarity => (rarities as readonly string[]).includes(x)),
  owned: (s) => ((ownedOptions as readonly string[]).includes(s) ? (s as Filters['owned']) : undefined),
  sortBy: (s) => ((sortByOptions as readonly string[]).includes(s) ? (s as Filters['sortBy']) : undefined),
  minNumber: numberParser,
  maxNumber: numberParser,
  deckbuildingMode: boolParser,
  allTextSearch: boolParser,
}

interface Props {
  children?: ReactNode
  cards: Map<number, CollectionRow>
  isPublic: boolean
  share?: boolean // undefined => disable, false => open settings, true => copy link
}

const defaultFilters: Filters = {
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
}

export default function CollectionCards({ children, cards, isPublic, share }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false) // used only on mobile

  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const res: Filters = { ...defaultFilters }

    const updateFilter = <K extends keyof Filters>(key: K, value: string) => {
      const parsed = filterParsers[key](value) as Filters[K]
      if (parsed !== undefined) {
        res[key] = parsed
      }
    }

    for (const key in res) {
      const raw = searchParams.get(key)
      if (raw != null) {
        updateFilter(key as keyof Filters, raw)
      }
    }
    return res
  }, [searchParams])

  const setFilters = (updates: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams)
    for (const key in updates) {
      const val = updates[key as keyof Filters]
      if (val == null || val === 'all' || (Array.isArray(val) && val.length === 0) || val === '') {
        params.delete(key)
      } else if (Array.isArray(val)) {
        params.set(key, val.join(','))
      } else {
        params.set(key, String(val))
      }
      setSearchParams(params)
    }
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const activeFilters = useMemo(() => {
    let res = 0
    for (const key in filters) {
      const k = key as keyof FiltersAll
      if (filters[k] !== defaultFilters[k]) {
        res++
      }
    }
    return res
  }, [filters])

  const filteredCards = useMemo(() => getFilteredCards(filters, cards), [filters, cards])

  return (
    <div className="flex justify-center gap-2 xl:gap-8 px-1">
      {isMobile ? (
        <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <CollectionFiltersPanel
              cards={filteredCards}
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
              share={share}
              missions={!isPublic}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80">
          <CollectionFiltersPanel
            cards={filteredCards}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            share={share}
            missions={!isPublic}
          />
        </div>
      )}
      <div className="w-full max-w-[900px]">
        {isMobile && (
          <div className="h-9 flex overflow-hidden text-center rounded-md text-sm font-medium border shadow-sm border-neutral-700 divide-x divide-neutral-700 [&>*]:cursor-pointer [&>*]:hover:bg-neutral-600 [&>*]:hover:text-neutral-50">
            <button type="button" className="flex-1" onClick={() => setIsFiltersSheetOpen(true)}>
              Filters
              {activeFilters > 0 && ` (${activeFilters})`}
            </button>
            {activeFilters > 0 && (
              <button type="button" className="group px-2" onClick={clearFilters}>
                <Trash2 className="stroke-neutral-200 group-hover:stroke-neutral-50" />
              </button>
            )}
          </div>
        )}
        <CardsTable cards={filteredCards} editable={!filters.deckbuildingMode && !isPublic} groupExpansions={filters.sortBy !== 'recent'}>
          {children}
        </CardsTable>
      </div>
    </div>
  )
}
