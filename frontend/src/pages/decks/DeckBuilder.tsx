import { SquareMinus, SquarePlus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useSearchParams } from 'react-router'
import { CardLine } from '@/components/CardLine'
import { CardsTable } from '@/components/CardsTable'
import FancyCard from '@/components/FancyCard'
import FiltersPanel from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { allCards, getCardByInternalId } from '@/lib/CardsDB'
import { type Filters, type FiltersAll, getFilteredCards } from '@/lib/filters'
import { useCollection } from '@/services/collection/useCollection'
import { serializeDeckToUrl } from './utils'

const defaultFilters: Filters = {
  search: '',
  expansion: 'all',
  cardType: [],
  rarity: [],
  sortBy: 'expansion-newest',
  allTextSearch: false,
}

export default function DeckBuilder() {
  const filtersCollapsed = useMediaQuery({ query: '(max-width: 1024px)' }) // tailwind "lg"
  const deckCollapsed = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [searchParams, setSearchParams] = useSearchParams()
  const { data: ownedCards } = useCollection()

  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false) // used only on mobile
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  const filteredCards = useMemo(() => getFilteredCards({ ...filters, deckbuildingMode: true }, ownedCards ?? new Map()), [allCards, ownedCards, filters])

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

  const [isDeckSheetOpen, setIsDeckSheetOpen] = useState(false) // used only on mobile
  const [deckCards, setDeckCards] = useState<Map<number, number>>(() => {
    const param = searchParams.get('deckCards')
    if (!param) {
      return new Map()
    } else {
      const arr = param
        .split(',')
        .map((str) => {
          const a = str.split(':')
          if (a.length !== 2) {
            return undefined
          }
          return [Number(a[0]), Math.min(Number(a[1]), 2)] as [number, number]
        })
        .filter((x) => !!x)
        .filter(([id, amount]) => !!getCardByInternalId(id) && amount > 0)
      return new Map(arr)
    }
  })

  const sortedDeckCards = useMemo(() => {
    return [...deckCards].toSorted(([id1, _amount1], [id2, _amount2]) => id1 - id2)
  }, [deckCards])

  const deckSize = useMemo(() => {
    let n = 0
    deckCards.forEach((val) => {
      n += val
    })
    return n
  }, [deckCards])

  const missingCards = useMemo(
    () => (ownedCards ? sortedDeckCards.reduce((acc, [id, amount]) => acc + Math.max(0, amount - (ownedCards.get(id)?.amount_owned ?? 0)), 0) : 0),
    [sortedDeckCards, ownedCards],
  )

  useEffect(() => {
    setSearchParams({ deckCards: serializeDeckToUrl(deckCards) })
  }, [deckCards])

  const addCard = useCallback(
    (id: number) => {
      setDeckCards((m1) => {
        const val = m1.get(id) ?? 0
        if (val >= 2) {
          return m1
        }
        const m2 = new Map(m1)
        m2.set(id, val + 1)
        return m2
      })
    },
    [setDeckCards],
  )

  const removeCard = useCallback(
    (id: number) => {
      setDeckCards((m1) => {
        const val = m1.get(id)
        if (val === undefined) {
          return m1
        }
        const m2 = new Map(m1)
        if (val <= 1) {
          m2.delete(id)
        } else {
          m2.set(id, val - 1)
        }
        return m2
      })
    },
    [setDeckCards],
  )

  const deckNode = (
    <>
      <ul className="overflow-y-auto space-y-1">
        {sortedDeckCards.map(([id, amount]) => {
          const card = getCardByInternalId(id)
          if (!card) {
            return null
          }
          const amount_owned = ownedCards && card.alternate_versions.reduce((acc, curr) => acc + (ownedCards.get(curr)?.amount_owned ?? 0), 0)
          const owned = amount_owned !== undefined && amount_owned < amount
          return (
            <li key={id} className="flex gap-1 rounded">
              <button type="button" className="enabled:cursor-pointer" onClick={() => removeCard(id)}>
                <SquareMinus className="size-5" />
              </button>
              <button type="button" className="enabled:cursor-pointer" onClick={() => addCard(id)} disabled={amount >= 2}>
                <SquarePlus className="size-5" />
              </button>
              <b className="mx-2">{amount}×</b>
              <CardLine
                className={`w-full ${owned ? 'bg-red-950' : ''}`}
                card_id={getCardByInternalId(id)?.card_id as string}
                id="hidden"
                amount={owned ? 'text-red-300' : ''}
                amount_owned={amount_owned}
              />
            </li>
          )
        })}
      </ul>
      <p className="mt-2">
        <span className={`${deckSize > 20 ? 'text-red-300' : ''}`}>{deckSize}</span>
        <span className="text-sm">/20 cards</span>
        {missingCards > 0 && <span className="text-sm"> ({missingCards} missing)</span>}
      </p>
      <p className="mt-2 text-sm">Want to save your deck? Bookmark this page!</p>
    </>
  )

  return (
    <div className="w-full mx-auto flex px-2 gap-4 justify-center">
      {filtersCollapsed ? (
        <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersPanel
              className="flex flex-col w-80 h-fit gap-2"
              filters={filters}
              setFilters={(obj) => setFilters((old) => ({ ...old, ...obj }))}
              clearFilters={() => setFilters(defaultFilters)}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <FiltersPanel
          className="flex flex-col w-80 h-fit gap-2"
          filters={filters}
          setFilters={(obj) => setFilters((old) => ({ ...old, ...obj }))}
          clearFilters={() => setFilters(defaultFilters)}
        />
      )}
      <CardsTable
        className="w-full lg:w-152 px-2"
        cards={filteredCards}
        render={(card) => (
          <>
            <button type="button" className="cursor-pointer" key={card.card_id} onClick={() => addCard(card.internal_id)}>
              <FancyCard card={card} selected={true} />
            </button>
            <p className="text-center">{card.name}</p>
          </>
        )}
      >
        <div className="flex flex-col sticky top-0 z-10 bg-neutral-900 mb-2">
          {filtersCollapsed && (
            <div className="h-9 mb-2 z-10 flex overflow-hidden text-center rounded-md text-sm font-medium border shadow-sm border-neutral-700 divide-x divide-neutral-700 [&>*]:cursor-pointer [&>*]:hover:bg-neutral-600 [&>*]:hover:text-neutral-50">
              <button type="button" className="flex-1" onClick={() => setIsFiltersSheetOpen(true)}>
                Filters
                {activeFilters > 0 && ` (${activeFilters})`}
              </button>
              {activeFilters > 0 && (
                <button type="button" className="group px-2" onClick={() => setFilters(defaultFilters)}>
                  <Trash2 className="stroke-neutral-200 group-hover:stroke-neutral-50" />
                </button>
              )}
            </div>
          )}
          {deckCollapsed && (
            <Button variant="outline" onClick={() => setIsDeckSheetOpen(true)}>
              Deck
            </Button>
          )}
        </div>
      </CardsTable>
      {deckCollapsed ? (
        <Sheet open={isDeckSheetOpen} onOpenChange={setIsDeckSheetOpen}>
          <SheetContent side="right" className="w-full">
            <SheetHeader>
              <SheetTitle>Deck</SheetTitle>
            </SheetHeader>
            {deckNode}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="min-w-80 md:w-108 h-fit p-2 rounded-lg border-1 border-neutral-700">{deckNode}</div>
      )}
    </div>
  )
}
