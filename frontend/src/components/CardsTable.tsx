import { useVirtualizer } from '@tanstack/react-virtual'
import i18n from 'i18next'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useWindowDimensions from '@/hooks/useWindowDimensionsHook.ts'
import { getExpansionById } from '@/lib/CardsDB.ts'
import type { Card as CardType, Expansion } from '@/types'
import { Card } from './Card.tsx'

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

interface Props {
  cards: CardType[]
  resetScrollTrigger?: boolean
  showStats?: boolean
  extraOffset: number
  editable?: boolean
  groupExpansions?: boolean
}

export function CardsTable({ cards, resetScrollTrigger, showStats, extraOffset, groupExpansions, editable = true }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { width } = useWindowDimensions()
  const { t } = useTranslation(['common/sets', 'pages/collection'])
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

  const updateScrollContainerHeight = () => {
    if (scrollRef.current) {
      const headerHeight = (document.querySelector('#header') as HTMLElement | null)?.offsetHeight || 0
      const filterbarHeight = (document.querySelector('#filterbar') as HTMLElement | null)?.offsetHeight || 0
      const maxHeight = window.innerHeight - headerHeight - filterbarHeight - extraOffset
      setScrollContainerHeight(`${maxHeight}px`)
    }
  }

  useLayoutEffect(() => {
    updateScrollContainerHeight()
  }, [width, extraOffset])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [resetScrollTrigger])

  const aspectRatio = 1.4
  // height of the card name + action buttons
  const descriptionOffset = width <= 780 ? 40 : 20
  const extraPadding = 8
  const trueWidth = Math.min(width, 900) - extraPadding
  const cardsPerRow = Math.max(Math.min(Math.floor(trueWidth / 170), 5), 3)
  const cardHeight = Math.round(aspectRatio * (trueWidth / cardsPerRow)) + descriptionOffset
  const basis = {
    3: 'basis-1/3',
    4: 'basis-1/4',
    5: 'basis-1/5',
  }[cardsPerRow] // Make sure Tailwind can see and actually generate the classes

  const rows: ({ id: string; type: 'header'; expansion: Expansion } | { id: string; type: 'row'; cards: CardType[] })[] = useMemo(
    () =>
      groupExpansions
        ? Object.entries(Object.groupBy(cards, (c) => c.expansion)).flatMap(([expansionId, cards]) => [
            {
              id: `header-${expansionId}`,
              type: 'header' as const,
              expansion: getExpansionById(expansionId) as Expansion,
            },
            ...chunk(cards, cardsPerRow).map((rowCards, i) => ({
              id: `row-${expansionId}-${i}`,
              type: 'row' as const,
              cards: rowCards,
            })),
          ])
        : chunk(cards, cardsPerRow).map((rowCards, i) => ({
            id: `row-${i}`,
            type: 'row' as const,
            cards: rowCards,
          })),
    [cards, cardsPerRow],
  )

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: rows.length,
    getItemKey: (index) => rows[index].id, // critical: stable keys per logical row
    estimateSize: (index) => (rows[index].type === 'header' ? 60 : cardHeight) + 12,
    overscan: 5,
  })

  return (
    <div ref={scrollRef} className="overflow-y-auto md:mt-4 px-4 flex flex-col" style={{ scrollbarWidth: 'none', height: scrollContainerHeight }}>
      {showStats && (
        <small className={`text-left mb-1 md:text-right ${groupExpansions && 'md:mb-[-25px]'}`}>
          {t('stats.summary', {
            ns: 'pages/collection',
            selected: cards.length,
            uniquesOwned: cards.filter((card) => (card.amount_owned ?? 0) > 0).length,
            totalOwned: cards.reduce((acc, card) => acc + (card.amount_owned ?? 0), 0),
          })}
        </small>
      )}
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative w-full">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
              className="absolute top-0 left-0 w-full"
            >
              {row.type === 'header' ? (
                <div className="flex items-center justify-start gap-2 mx-auto max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 tracking-tight transition-colors first:mt-0">
                  <img
                    src={`/images/sets/${i18n.language}/${row.expansion.id}.webp`}
                    alt={row.expansion.name}
                    className="max-w-[60px]"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = `/images/sets/en-US/${row.expansion.name}.webp`
                    }}
                  />
                  <h2 className="text-center font-semibold sm:text-lg md:text-2xl">{t(row.expansion.name)}</h2>
                </div>
              ) : (
                <div className="w-full flex justify-start">
                  {row.cards.map((c) => (
                    <Card key={c.card_id + c.amount_owned} card={c} editable={editable} className={`${basis} min-w-0 px-1 sm:px-2`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
