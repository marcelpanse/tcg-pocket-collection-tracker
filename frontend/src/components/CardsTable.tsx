import { createColumnHelper, getCoreRowModel, getGroupedRowModel, type Row, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import type { Card as CardType } from '@/types'
import { Card } from './Card.tsx'

const columnHelper = createColumnHelper<CardType>()

interface Props {
  cards: CardType[]
  resetScrollTrigger?: boolean
  showStats?: boolean
  extraOffset: number
  editable?: boolean
}

export function CardsTable({ cards, resetScrollTrigger, showStats, extraOffset, editable = true }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { width } = useWindowDimensions()
  const { t } = useTranslation('common/sets')
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

  useLayoutEffect(() => {
    const updateScrollContainerHeight = () => {
      if (scrollRef.current) {
        const headerHeight = (document.querySelector('#header') as HTMLElement | null)?.offsetHeight || 0
        const filterbarHeight = (document.querySelector('#filterbar') as HTMLElement | null)?.offsetHeight || 0
        const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
        const offset = isMobileDevice ? 0 : extraOffset
        const maxHeight = window.innerHeight - headerHeight - filterbarHeight - offset
        setScrollContainerHeight(`${maxHeight}px`)
      }
    }

    updateScrollContainerHeight()
    window.addEventListener('resize', updateScrollContainerHeight)

    return () => {
      window.removeEventListener('resize', updateScrollContainerHeight)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [resetScrollTrigger])

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('image', {
        id: 'imageUrl',
      }),
      columnHelper.accessor('card_id', {
        id: 'card_id',
      }),
      columnHelper.accessor('name', {
        id: 'name',
      }),
      columnHelper.accessor('set_details', {
        id: 'set_details',
      }),
    ]
  }, [])

  const table = useReactTable({
    columns,
    data: cards,
    enableGrouping: true,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      grouping: ['set_details'],
    },
    autoResetPageIndex: false,
  })

  const groupedRows = useMemo(() => table.getGroupedRowModel().rows, [table.getGroupedRowModel().rows])

  let cardsPerRow = 5
  let cardHeight = Math.min(width, 890) / 5 + 120
  if (width > 600 && width < 800) {
    cardsPerRow = 4
    cardHeight = width / 3 + 50
  } else if (width <= 600) {
    cardsPerRow = 3
    cardHeight = width / 3 + 100
  }

  // Build groups and keep a stable group key (Row has an .id)
  const groupedGridRows = useMemo(
    () =>
      groupedRows.map((groupRow) => {
        const header = { type: 'header' as const, row: groupRow }
        const dataRows = groupRow.subRows.map((subRow) => ({ type: 'data' as const, row: subRow }))

        const gridRows: Array<{ type: 'data'; row: Row<CardType> }[]> = []
        for (let i = 0; i < dataRows.length; i += cardsPerRow) {
          gridRows.push(dataRows.slice(i, i + cardsPerRow))
        }

        // groupRow.id is stable for the group
        return { groupId: groupRow.id, header, gridRows }
      }),
    [groupedRows, cardsPerRow],
  )

  // Create flattened rows with stable keys for virtualization
  const flattenedRows = useMemo(
    () =>
      groupedGridRows.flatMap((group) => [
        {
          id: `header-${group.groupId}`,
          type: 'header' as const,
          height: 60,
          data: group.header,
        },
        ...group.gridRows.map((gridRow, i) => ({
          id: `grid-${group.groupId}-${i}`,
          type: 'gridRow' as const,
          height: cardHeight,
          data: gridRow,
        })),
      ]),
    [groupedGridRows, cardHeight],
  )

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: flattenedRows.length,
    getItemKey: (index) => flattenedRows[index].id, // critical: stable keys per logical row
    estimateSize: (index) => (flattenedRows[index].type === 'header' ? 60 : cardHeight) + 12,
    overscan: 5,
  })

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto overflow-x-hidden mt-2 sm:mt-4 px-4 flex flex-col justify-start w-full"
      style={{ scrollbarWidth: 'none', height: scrollContainerHeight }}
    >
      {showStats && (
        <small className="text-left md:text-right mb-3 md:mb-[-25px] md:mt-[10px]">
          {cards.filter((c) => !c.linkedCardID).length} selected, {cards.filter((card) => (card.amount_owned ?? 0) > 0).length} uniques owned,{' '}
          {cards.reduce((acc, card) => acc + (card.amount_owned ?? 0), 0)} total owned
        </small>
      )}
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative w-full">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = flattenedRows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
              className="absolute top-0 left-0 w-full"
            >
              {row.type === 'header' ? (
                <div className="flex items-center justify-start gap-2 mx-auto max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 tracking-tight transition-colors first:mt-0">
                  <img
                    src={`/images/sets/${(row.data as { type: string; row: Row<CardType> }).row.original.expansion}.webp`}
                    alt={(row.data as { type: string; row: Row<CardType> }).row.getValue('set_details') as string}
                    className="h-6 sm:h-8"
                  />
                  <h2 className="text-center font-semibold text-md sm:text-lg md:text-2xl ">
                    {t((row.data as { type: string; row: Row<CardType> }).row.getValue('set_details') as string)}
                  </h2>
                </div>
              ) : (
                <div className="flex justify-start gap-x-3 ml-2">
                  {(row.data as { type: string; row: Row<CardType> }[]).map(({ row: subRow }) => (
                    <Card key={subRow.original.card_id + subRow.original.amount_owned} card={subRow.original} editable={editable} />
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
