import { createColumnHelper, getCoreRowModel, getGroupedRowModel, type Row, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import i18n from 'i18next'
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
  const { t } = useTranslation(['common/sets', 'pages/collection'])
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

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

  useLayoutEffect(() => {
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

  useEffect(() => updateScrollContainerHeight)

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

  const aspectRatio = 1.71
  const extraPadding = 8
  const trueWidth = Math.min(width, 900) - extraPadding
  const cardsPerRow = Math.max(Math.min(Math.floor(trueWidth / 170), 5), 3)
  const cardHeight = (aspectRatio * trueWidth) / cardsPerRow - 10
  const basis = {
    3: 'basis-1/3',
    4: 'basis-1/4',
    5: 'basis-1/5',
  }[cardsPerRow] // Make sure Tailwind can see and actually generate the classes

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
    <div ref={scrollRef} className="overflow-y-auto md:mt-4 px-4 flex flex-col" style={{ scrollbarWidth: 'none', height: scrollContainerHeight }}>
      {showStats && (
        <small className="text-left mb-1 md:text-right md:mb-[-25px]">
          {t('stats.summary', {
            ns: 'pages/collection',
            selected: cards.filter((c) => !c.linkedCardID).length,
            uniquesOwned: cards.filter((card) => (card.amount_owned ?? 0) > 0).length,
            totalOwned: cards.reduce((acc, card) => acc + (card.amount_owned ?? 0), 0),
          })}
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
                    src={`/images/sets/${i18n.language}/${(row.data as { type: string; row: Row<CardType> }).row.original.expansion}.webp`}
                    alt={(row.data as { type: string; row: Row<CardType> }).row.getValue('set_details') as string}
                    className="max-w-[60px]"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        `/images/sets/en-US/${(row.data as { type: string; row: Row<CardType> }).row.original.expansion}.webp`
                    }}
                  />
                  <h2 className="text-center font-semibold sm:text-lg md:text-2xl ">
                    {t((row.data as { type: string; row: Row<CardType> }).row.getValue('set_details') as string)}
                  </h2>
                </div>
              ) : (
                <div className="w-full flex justify-start">
                  {(row.data as { type: string; row: Row<CardType> }[]).map(({ row: subRow }) => (
                    <Card
                      key={subRow.original.card_id + subRow.original.amount_owned}
                      card={subRow.original}
                      editable={editable}
                      className={`${basis} min-w-0 px-1 sm:px-2`}
                    />
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
