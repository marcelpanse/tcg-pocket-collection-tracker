import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import { a1Cards, a1aCards, a2Cards, paCards } from '@/lib/CardsDB'
import type { Card, CollectionRow } from '@/types'
import { type Row, createColumnHelper, getCoreRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ID, type Models } from 'appwrite'
import { type FC, useMemo, useRef } from 'react'
import type { Card as CardType } from '../types'
import FancyCard from './FancyCard'

const PackHeader = ({ title }: { title: string }) => {
  return <h2 className="mt-10 w-full scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">{title}</h2>
}

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
  setOwnedCards: (cards: CollectionRow[]) => void
}

const columnHelper = createColumnHelper<CardType>()

export const Cards: FC<Props> = ({ user, ownedCards, setOwnedCards }) => {
  const updateCardCount = async (cardId: string, increment: number) => {
    console.log(`${cardId} button clicked`)
    const db = await getDatabase()
    const ownedCard = ownedCards.find((row) => row.card_id === cardId)

    if (ownedCard) {
      console.log('updating', ownedCard)
      ownedCard.amount_owned = Math.max(0, ownedCard.amount_owned + increment)
      setOwnedCards([...ownedCards])
      await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
        amount_owned: ownedCard.amount_owned,
      })
    } else if (!ownedCard && increment > 0) {
      console.log('adding new card', cardId)
      const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        email: user?.email,
        card_id: cardId,
        amount_owned: increment,
      })
      setOwnedCards([
        ...ownedCards,
        {
          $id: newCard.$id,
          email: newCard.email,
          card_id: newCard.card_id,
          amount_owned: newCard.amount_owned,
        },
      ])
    }
  }

  const Card = ({ card }: { card: CardType }) => {
    const amountOwned = ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0
    return (
      <div className="flex flex-col items-center gap-y-2 w-fit border border-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 group">
        <FancyCard card={card} selected={amountOwned > 0} setIsSelected={() => {}} />
        <p className="text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
          {card.card_id} - {card.name}
        </p>
        <div className="flex items-center gap-x-4">
          <button
            type="button"
            onClick={() => updateCardCount(card.card_id, -1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-400 transition duration-200 focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10z" />
            </svg>
          </button>
          <span className="text-lg font-semibold">{amountOwned}</span>
          <button
            type="button"
            onClick={() => updateCardCount(card.card_id, 1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-400 transition duration-200 focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const Pack = ({ cards }: { cards: CardType[] }) => {
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
      data: cards,
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
                  <PackHeader title={(row.data as { type: string; row: Row<Card> }).row.getValue('pack')} />
                ) : (
                  <div className="flex justify-center gap-5">
                    {(row.data as { type: string; row: Row<Card> }[]).map(({ row: subRow }) => (
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

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <Tabs defaultValue="a1">
        <TabsList className="m-auto mt-4 mb-8">
          <TabsTrigger value="a1">A1 - Genetic Apex</TabsTrigger>
          <TabsTrigger value="a1a">A1A - Mythical Island</TabsTrigger>
          <TabsTrigger value="a2">A2 - Space Time Smackdown</TabsTrigger>
          <TabsTrigger value="pa">PA - Promo A</TabsTrigger>
        </TabsList>
        <TabsContent value="a1">
          <Pack cards={a1Cards} />
        </TabsContent>
        <TabsContent value="a1a">
          <Pack cards={a1aCards} />
        </TabsContent>
        <TabsContent value="a2">
          <Pack cards={a2Cards} />
        </TabsContent>
        <TabsContent value="pa">
          <Pack cards={paCards} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
