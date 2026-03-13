import { useVirtualizer } from '@tanstack/react-virtual'
import i18n from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { CardLine } from '@/components/CardLine'
import { DropdownFilter } from '@/components/Filters'
import SearchInput from '@/components/filters/SearchInput'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { getFilteredCards } from '@/lib/filters'
import { formatLanguage, getCardNameByLang } from '@/lib/utils.ts'
import { useAccount } from '@/services/account/useAccount'
import { type GameLanguage, gameLanguages, tradableRarities } from '@/types'

function buildUrl(card: number | undefined, language: GameLanguage | '') {
  const url = '/trade/matches/results'

  const params = new URLSearchParams()
  if (card !== undefined) {
    params.append('card_id', String(card))
  }
  if (language !== '') {
    params.append('language', language)
  }

  return params.size > 0 ? `${url}?${params.toString()}` : url
}

export default function TradeMatches() {
  const { t } = useTranslation(['trade-matches', 'common'])
  const navigate = useNavigate()

  const scrollRef = useRef(null)
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<number>()
  const { data: account } = useAccount()
  const [selectedLanguage, setSelectedLanguage] = useState<GameLanguage | ''>('')
  useEffect(() => {
    if (account?.language) {
      setSelectedLanguage(account.language as GameLanguage)
    }
  }, [account?.language])
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
      <div ref={scrollRef} className="mt-2 h-72 rounded-md border border-neutral-700 px-1 overflow-y-auto">
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
      <DropdownFilter
        className="mt-2"
        label="Card language"
        options={['', ...gameLanguages]}
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        show={(x) => (x === '' ? 'Any language' : formatLanguage[x])}
      />
      <div className="flex gap-2 mt-4">
        <Button className="w-full" onClick={() => navigate(buildUrl(selectedCard, selectedLanguage))}>
          {card ? t('search.byCard', { cardName: getCardNameByLang(card, i18n.language) }) : t('search.allCards')}
        </Button>
      </div>
    </div>
  )
}
