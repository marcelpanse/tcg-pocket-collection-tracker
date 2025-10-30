import { useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useSearchParams } from 'react-router'
import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel from '@/components/FiltersPanel'
import { type CardTypeOption, cardTypeOptions, expansionOptions, type Filters, getFilteredCards, ownedOptions, sortByOptions } from '@/lib/filters'
import { type CollectionRow, type Rarity, rarities } from '@/types'

const numberParser = (s: string) => {
  const x = Number(s)
  return Number.isNaN(x) ? undefined : x
}
const boolParser = (s: string) => {
  return s === 'true' ? true : s === 'false' ? false : undefined
}

const filterParsers: { [K in keyof Filters]: (s: string) => Filters[K] | undefined } = {
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
  cards: Map<number, CollectionRow>
  isPublic: boolean
  extraOffset: number
  share?: boolean // undefined => disable, false => open settings, true => copy link
}

export default function CollectionCards({ cards, isPublic, extraOffset, share }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const res: Filters = {
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
        clearFilters={clearFilters}
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
        share={share}
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
