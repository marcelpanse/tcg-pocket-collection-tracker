import type { Card } from '@/types'
import { type Row, createColumnHelper, getCoreRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef } from 'react'
import type { Card as CardType } from '../types'
import FancyCard from './FancyCard'

const tradeableRaritiesDictionary: { [id: string]: number } = {
  '◊': 0,
  '◊◊': 0,
  '◊◊◊': 120,
  '◊◊◊◊': 500,
  '☆': 500,
}

export function LookingForTrade({ cards }: { cards: CardType[] }) {
  const columnHelper = createColumnHelper<CardType>()
  const parentRef = useRef<HTMLDivElement>(null)

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
      columnHelper.accessor('pack', {
        id: 'pack',
      }),
    ]
  }, [])

  // Columns and data are defined in a stable reference, will not cause infinite loop!
  const table = useReactTable({
    columns,
    data: cards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity)),
    enableGrouping: true,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      grouping: ['pack'],
    },
  })
  const groupedRows = table.getRowModel().rows

  const groupedGridRows = groupedRows.map((groupRow) => {
    const header = { type: 'header', row: groupRow }
    const dataRows = groupRow.subRows.map((subRow) => ({ type: 'data', row: subRow }))

    const gridRows = []
    for (let i = 0; i < dataRows.length; i += 5) {
      gridRows.push(dataRows.slice(i, i + 5))
    }

    return { header, gridRows }
  })

  const flattenedRows = groupedGridRows.flatMap((group) => [
    { type: 'header', height: 45, data: group.header }, // Group header
    ...group.gridRows.map((gridRow) => ({ type: 'gridRow', height: 269, data: gridRow })), // Grid rows
  ])

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: flattenedRows.length,
    estimateSize: (index) => (flattenedRows[index].type === 'header' ? 45 : 269) + 12,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[calc(100vh-180px)] overflow-y-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
        className="w-full"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = flattenedRows[virtualRow.index]
          console.log('Row', row)
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.type === 'header' ? (
                <h2 className="mt-10 w-[900px] mx-auto scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                  {(row.data as { type: string; row: Row<Card> }).row.getValue('pack')}
                </h2>
              ) : (
                <div className="flex justify-center gap-5">
                  {(row.data as { type: string; row: Row<Card> }[]).map(({ row: subRow }) => {
                    const card = subRow.original
                    return (
                      <div
                        key={`div_${subRow.original.card_id}`}
                        className="flex flex-col items-center gap-y-2 w-fit border border-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 group"
                      >
                        <FancyCard key={`card_${card.card_id}`} card={card} selected={true} setIsSelected={() => {}} />
                        <p className="text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          {card.card_id} - {card.name}
                        </p>
                        <div className="bg-gray-600 rounded-xl">
                          <span className="text-lg font-semibold m-3">{tradeableRaritiesDictionary[card.rarity]}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
