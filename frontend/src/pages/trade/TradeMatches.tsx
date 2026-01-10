import { useVirtualizer } from '@tanstack/react-virtual'
import i18n from 'i18next'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { CardLine } from '@/components/CardLine'
import SearchInput from '@/components/filters/SearchInput'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { getFilteredCards } from '@/lib/filters'
import { getCardNameByLang } from '@/lib/utils.ts'
import { tradableRarities } from '@/types'

export default function TradeMatches() {
  const { t } = useTranslation(['trade-matches', 'common'])
  const navigate = useNavigate()

  const scrollRef = useRef(null)
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<number>()
  const cards = getFilteredCards({ search, rarity: [...tradableRarities] }, new Map())
  const card = selectedCard && getCardByInternalId(selectedCard)

  const virtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: cards.length,
    getItemKey: (index) => cards[index].card_id,
    estimateSize: () => 32,
  })

  if (selectedCard && !card) {
    throw new Error('Selected card was not found in the database')
  }

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
        <Button className="w-1/2" disabled={!selectedCard} onClick={() => navigate(`/trade/matches/results?card_id=${selectedCard}`)}>
          {card ? t('search.byCard', { cardName: getCardNameByLang(card, i18n.language) }) : t('search.selectCard')}
        </Button>
        <Button className="w-1/2" onClick={() => navigate('/trade/matches/results')}>
          {t('search.allCards')}
        </Button>
      </div>
    </div>
  )
}
