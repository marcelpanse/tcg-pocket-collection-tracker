import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'
import { CardLine } from '@/components/CardLine'
import SearchInput from '@/components/filters/SearchInput'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { getFilteredCards } from '@/lib/filters'
import { tradableRarities } from '@/types'

function TradeMatches() {
  // const { t } = useTranslation(['trade-matches', 'common'])

  const scrollRef = useRef(null)
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<number>()
  const cards = useMemo(() => getFilteredCards({ search, rarity: [...tradableRarities] }, new Map()), [search])

  const virtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: cards.length,
    getItemKey: (index) => cards[index].card_id,
    estimateSize: () => 32,
  })

  return (
    <div className="max-w-sm mx-auto">
      <SearchInput setValue={setSearch} />
      <div ref={scrollRef} className="my-2 h-96 rounded border border-neutral-700 px-1 overflow-y-auto">
        <ul style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
          {virtualizer.getVirtualItems().map((row) => {
            const c = cards[row.index]
            return (
              <button
                type="button"
                key={row.key}
                className="absolute top-0 left-0 w-full cursor-pointer"
                style={{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }}
                onClick={() => setSelectedCard((prev) => (prev === c.internal_id ? undefined : c.internal_id))}
              >
                <CardLine className={`w-full ${selectedCard === c.internal_id && 'bg-green-900'} hover:bg-neutral-600`} card_id={c.card_id} />
              </button>
            )
          })}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button className="w-1/2" disabled={!selectedCard}>
          {selectedCard ? `Search ${getCardByInternalId(selectedCard)?.name}` : `Select card to search`}
        </Button>
        <Button className="w-1/2">Search all cards</Button>
      </div>
    </div>
  )
}

export default TradeMatches
