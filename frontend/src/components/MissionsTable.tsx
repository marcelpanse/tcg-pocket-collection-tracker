import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import type { Mission } from '@/types'
import { type Row, createColumnHelper, getCoreRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from './Card.tsx'

const columnHelper = createColumnHelper<Mission>()

interface Props {
  missions: Mission[]
  resetScrollTrigger?: boolean
}

export function MissionsTable({ missions, resetScrollTrigger }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { width } = useWindowDimensions()
  const { t } = useTranslation('common/sets')
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

  useLayoutEffect(() => {
    const updateScrollContainerHeight = () => {
      if (scrollRef.current) {
        const headerHeight = (document.querySelector('#header') as HTMLElement | null)?.offsetHeight || 0
        const filterbarHeight = (document.querySelector('#filterbar') as HTMLElement | null)?.offsetHeight || 0
        const maxHeight = window.innerHeight - headerHeight - filterbarHeight

        setScrollContainerHeight(`${maxHeight}px`)
      }
    }

    updateScrollContainerHeight() // initial calculation
    window.addEventListener('resize', updateScrollContainerHeight)

    return () => {
      window.removeEventListener('resize', updateScrollContainerHeight)
    }
  }, []) // You can add dependencies here if needed

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [resetScrollTrigger])

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('name', {
        id: 'name',
      }),
      columnHelper.accessor('requiredCards', {
        id: 'cards',
      }),
      columnHelper.accessor('reward', {
        id: 'reward',
      }),
    ]
  }, [])

  const table = useReactTable({
    columns,
    data: missions,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      grouping: ['name'],
    },
    autoResetPageIndex: false, //we need this to prevent a React state update when the component is not yet mounted
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

  const groupedGridRows = useMemo(
    () =>
      groupedRows.map((groupRow) => {
        const header = { type: 'header', row: groupRow }
        const dataRows = groupRow.subRows.map((subRow) => ({ type: 'data', row: subRow }))

        const gridRows = []
        for (let i = 0; i < dataRows.length; i += cardsPerRow) {
          gridRows.push(dataRows.slice(i, i + cardsPerRow))
        }

        return { header, gridRows }
      }),
    [groupedRows, cardsPerRow],
  )

  const flattenedRows = useMemo(
    () =>
      groupedGridRows.flatMap((group) => [
        { type: 'header', height: 60, data: group.header },
        ...group.gridRows.map((gridRow) => ({ type: 'gridRow', height: cardHeight, data: gridRow })),
      ]),
    [groupedGridRows],
  )

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: flattenedRows.length,
    estimateSize: (index) => (flattenedRows[index].type === 'header' ? 60 : cardHeight) + 12,
    overscan: 5,
  })

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto mt-2 sm:mt-4 px-4 flex flex-col justify-start"
      style={{ scrollbarWidth: 'none', height: scrollContainerHeight }}
    >
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative w-full">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = flattenedRows[virtualRow.index]
          // @ts-ignore
          // @ts-ignore
          return (
            <div
              key={virtualRow.key}
              style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
              className="absolute top-0 left-0 w-full"
            >
              {row.type === 'header' ? (
                <h2 className="mx-auto mt-10 text-center w-full max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 font-semibold text-md sm:text-lg md:text-2xl tracking-tight transition-colors first:mt-0">
                  {t((row.data as { type: string; row: Row<Mission> }).row.getValue('name') as string)}
                </h2>
              ) : (
                <div className="flex justify-center gap-x-3">
                  {(row.data as { type: string; row: Row<Mission> }[]).map(({ row: subRow }) =>
                    subRow.original.requiredCards.map((missionCard) => {
                      if (missionCard.cards) {
                        return missionCard.cards.map((c) => <Card key={c.card_id} card={c} />)
                      }
                      return null
                    }),
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
