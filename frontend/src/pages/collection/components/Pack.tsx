import type { Card as CardType } from '@/types'
import { type Row, createColumnHelper, getCoreRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from './Card'

const columnHelper = createColumnHelper<CardType>()

interface Props {
  cards: CardType[]
}

export function Pack({ cards }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(() => {
    const savedPosition = localStorage.getItem('scrollPosition')
    return savedPosition ? Number.parseInt(savedPosition, 10) : 0
  })

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

  // Columns and data are defined in a stable reference, will not cause infinite loop!
  const table = useReactTable({
    columns,
    data: cards,
    enableGrouping: true,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      grouping: ['set_details'],
    },
  })
  const groupedRows = useMemo(() => table.getGroupedRowModel().rows, [table.getGroupedRowModel().rows]) // Get grouped rows from the table model

  const groupedGridRows = useMemo(
    () =>
      groupedRows.map((groupRow) => {
        const header = { type: 'header', row: groupRow }
        const dataRows = groupRow.subRows.map((subRow) => ({ type: 'data', row: subRow }))

        const gridRows = []
        for (let i = 0; i < dataRows.length; i += 5) {
          gridRows.push(dataRows.slice(i, i + 5))
        }

        return { header, gridRows }
      }),
    [groupedRows],
  )

  const flattenedRows = useMemo(
    () =>
      groupedGridRows.flatMap((group) => [
        { type: 'header', height: 45, data: group.header }, // Group header
        ...group.gridRows.map((gridRow) => ({ type: 'gridRow', height: 269, data: gridRow })), // Grid rows
      ]),
    [groupedGridRows],
  )

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: flattenedRows.length,
    estimateSize: (index) => (flattenedRows[index].type === 'header' ? 45 : 269) + 12,
    overscan: 5,
  })

  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        const newPosition = parentRef.current.scrollTop
        setScrollPosition(newPosition)
        localStorage.setItem('scrollPosition', newPosition.toString())
      }
    }

    const parentElement = parentRef.current
    if (parentElement) {
      parentElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (parentElement) {
        parentElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = scrollPosition
    }
  }, [scrollPosition])

  return (
    <div ref={parentRef} className="h-[calc(100vh-180px)] overflow-y-auto">
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
                <h2 className="mt-10 w-full scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
                  {(row.data as { type: string; row: Row<CardType> }).row.getValue('set_details')}
                </h2>
              ) : (
                <div className="flex justify-center gap-5">
                  {(row.data as { type: string; row: Row<CardType> }[]).map(({ row: subRow }) => (
                    <Card key={subRow.original.card_id} card={subRow.original} />
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
