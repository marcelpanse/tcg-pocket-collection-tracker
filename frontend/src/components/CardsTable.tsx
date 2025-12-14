import { useVirtualizer } from '@tanstack/react-virtual'
import i18n from 'i18next'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getExpansionById } from '@/lib/CardsDB.ts'
import { chunk, cn } from '@/lib/utils.ts'
import { type Card as CardType, type Expansion, type ExpansionId, expansionIds } from '@/types'

interface Props {
  className?: string
  children?: ReactNode
  cards: CardType[]
  groupExpansions?: boolean

  render: (card: CardType) => ReactNode
}

export function CardsTable({ className, children, cards, groupExpansions, render }: Props) {
  const { t } = useTranslation(['common/sets', 'pages/collection'])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
      const headerHeight = (document.querySelector('#header') as HTMLElement | null)?.offsetHeight || 0
      const maxHeight = window.innerHeight - headerHeight
      setScrollContainerHeight(`${maxHeight}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { cardsPerRow, cardHeight, basis } = useMemo(() => {
    const aspectRatio = 1.4
    const descriptionOffset = 40 // height of the card name + action buttons
    const cardsPerRow = Math.max(Math.min(Math.floor(width / 170), 5), 3)
    const cardHeight = Math.round(aspectRatio * (width / cardsPerRow)) + descriptionOffset
    const basis = {
      3: 'basis-1/3',
      4: 'basis-1/4',
      5: 'basis-1/5',
    }[cardsPerRow] // Make sure Tailwind can see and actually generate the classes
    return { cardsPerRow, cardHeight, basis }
  }, [width])

  const rows: ({ id: string; type: 'header'; expansion: Expansion } | { id: string; type: 'row'; cards: CardType[] })[] = useMemo(
    () =>
      groupExpansions
        ? Object.entries(Object.groupBy(cards, (c) => c.expansion))
            .toSorted(([id1, _cards1], [id2, _cards2]) => expansionIds.indexOf(id1 as ExpansionId) - expansionIds.indexOf(id2 as ExpansionId))
            .flatMap(([expansionId, cards]) => [
              {
                id: `header-${expansionId}`,
                type: 'header' as const,
                expansion: getExpansionById(expansionId as ExpansionId),
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

  const getItemKey = useCallback((index: number) => {
    return rows[index].id // critical: stable keys per logical row
  }, [])

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: rows.length,
    getItemKey,
    estimateSize: (index) => (rows[index].type === 'header' ? 52 : cardHeight + 8),
    overscan: 5,
  })

  return (
    <div ref={scrollRef} className={cn('overflow-y-auto', className)} style={{ scrollbarWidth: 'thin' }}>
      {children}
      {cards.length === 0 && <p className="text-xl text-center py-8">No cards to show</p>}
      <div style={{ height: scrollContainerHeight }}>
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
                  <div className="flex items-center gap-2 scroll-m-20 border-b-2 border-slate-600 pb-2 tracking-tight transition-colors">
                    <img
                      src={`/images/sets/${i18n.language}/${row.expansion.id}.webp`}
                      alt={row.expansion.name}
                      className="max-w-15"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = `/images/sets/en-US/${row.expansion.id}.webp`
                      }}
                    />
                    <h2 className="text-center font-semibold sm:text-lg md:text-2xl">{t(row.expansion.name)}</h2>
                  </div>
                ) : (
                  <div className="w-full flex justify-start">
                    {row.cards.map((c) => (
                      <div key={`${c.expansion}-${c.internal_id}`} className={`${basis} min-w-0 px-2`}>
                        {render(c)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
