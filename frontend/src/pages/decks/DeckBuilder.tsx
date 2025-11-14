import { useVirtualizer } from '@tanstack/react-virtual'
import { SquareMinus, SquarePlus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CardLine } from '@/components/CardLine'
import FancyCard from '@/components/FancyCard'
import FiltersPanel from '@/components/FiltersPanel'
import { allCards, getCardByInternalId } from '@/lib/CardsDB'
import { type Filters, getFilteredCards } from '@/lib/filters'
import { chunk } from '@/lib/utils'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: ownedCards } = useCollection()

  const [filters, setFilters] = useState<Filters>(defaultFilters)

  const filteredCards = useMemo(() => getFilteredCards({ ...filters, deckbuildingMode: true }, ownedCards ?? new Map()), [allCards, ownedCards, filters])

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

  const cardsPerRow = 3
  const rows = filteredCards && chunk(filteredCards, cardsPerRow)
  const ref = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    getScrollElement: () => ref.current,
    count: rows?.length ?? 0,
    estimateSize: () => 310,
    overscan: 5,
  })

  return (
    <div className="w-full mx-auto flex px-2 gap-4 justify-center">
      <FiltersPanel
        className="flex flex-col w-80 h-fit gap-2"
        filters={filters}
        setFilters={(obj) => setFilters((old) => ({ ...old, ...obj }))}
        clearFilters={() => setFilters(defaultFilters)}
      />
      <div ref={ref} className="w-152 h-[800px] overflow-y-auto px-2">
        <div className="relative w-full mt-2" style={{ height: `${virtualizer.getTotalSize()}px` }}>
          {rows &&
            virtualizer.getVirtualItems().map((item) => (
              <div key={item.key} className="absolute top-0 left-0 w-full flex gap-x-2" style={{ transform: `translateY(${item.start}px)` }}>
                {rows[item.index].map((card) => (
                  <div key={card.internal_id} className="w-48">
                    <button type="button" className="cursor-pointer" key={card.card_id} onClick={() => addCard(card.internal_id)}>
                      <FancyCard card={card} selected={true} />
                    </button>
                    <p className="text-center">{card.name}</p>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
      <div className="w-108 shrink-0 h-fit p-2 rounded-lg border-1 border-neutral-700">
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
      </div>
    </div>
  )
}
