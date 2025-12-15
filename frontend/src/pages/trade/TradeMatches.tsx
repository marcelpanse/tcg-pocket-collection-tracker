import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CardLine } from '@/components/CardLine'
import SearchInput from '@/components/filters/SearchInput'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { getFilteredCards } from '@/lib/filters'
import { useTradingPartners } from '@/services/trade/useTrade.ts'
import { tradableRarities } from '@/types'

function TradeMatches() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const scrollRef = useRef(null)
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<number>()
  const [showResults, setShowResults] = useState(false)
  const cards = useMemo(() => getFilteredCards({ search, rarity: [...tradableRarities] }, new Map()), [search])

  const { data: tradingPartners, isLoading, isError } = useTradingPartners(showResults, selectedCard)

  const virtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: cards.length,
    getItemKey: (index) => cards[index].card_id,
    estimateSize: () => 32,
  })

  if (!showResults) {
    return (
      <div className="sm:w-sm mx-auto">
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
          <Button
            className="w-1/2"
            disabled={!selectedCard}
            onClick={() => {
              setShowResults(true)
            }}
          >
            {selectedCard ? `Search ${getCardByInternalId(selectedCard)?.name}` : `Select card to search`}
          </Button>
          <Button
            className="w-1/2"
            onClick={() => {
              setSelectedCard(undefined)
              setShowResults(true)
            }}
          >
            Search all cards
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <p className="text-xl text-center py-8">
        {t('common:loading')}
        <br />
        {t('longOperation')}
      </p>
    )
  }

  if (isError || !tradingPartners) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  if (tradingPartners.length === 0) {
    return <p className="text-xl text-center py-8">{t('noTradePartners')}</p>
  }

  const linkSuffix = selectedCard ? `?friend_card=${selectedCard}` : ''
  return (
    <div className="flex flex-col gap-4">
      {tradingPartners.map((partner) => (
        <div key={partner.friend_id} className="max-w-md w-full flex justify-between items-center mx-auto px-4">
          <p className="mr-2">{partner.username}</p>
          <Link to={`/trade/${partner.friend_id}${linkSuffix}`}>
            <Button variant="outline" className="my-auto">
              {t('viewTradePartner', { tradeMatches: partner.trade_matches })}
              <ChevronRight />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default TradeMatches
