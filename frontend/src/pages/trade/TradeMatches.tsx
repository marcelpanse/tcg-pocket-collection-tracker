import i18n from 'i18next'
import { Trash2 } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { DropdownFilter } from '@/components/Filters'
import { SelectCardContext } from '@/components/SelectCard'
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

  const { selectCard } = useContext(SelectCardContext)

  const [selectedCard, setSelectedCard] = useState<number | undefined>(undefined)
  const { data: account } = useAccount()
  const [selectedLanguage, setSelectedLanguage] = useState<GameLanguage | ''>('')
  useEffect(() => {
    if (account?.language) {
      setSelectedLanguage(account.language as GameLanguage)
    }
  }, [account?.language])
  const cards = getFilteredCards({ rarity: [...tradableRarities] }, new Map())
  const card = selectedCard && getCardByInternalId(selectedCard)

  if (selectedCard && !card) {
    throw new Error('Selected card was not found in the database')
  }

  return (
    <div className="max-w-xs w-full mx-auto p-4 rounded-md border bg-neutral-800 border-neutral-700">
      <h1 className="text-lg mb-4">Find trades</h1>
      <DropdownFilter
        className="mt-2 bg-neutral-900"
        label="Card language"
        options={['', ...gameLanguages]}
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        show={(x) => (x === '' ? 'Any language' : formatLanguage[x])}
      />
      <div className="h-9 mt-2 flex rounded border border-neutral-700 divide-x divide-neutral-700 bg-neutral-900 [&>*:enabled]:hover:bg-neutral-600 [&>*:disabled]:opacity-50">
        <button className="flex-1" onClick={() => selectCard({ cards, callback: setSelectedCard })} type="button">
          {card ? getCardNameByLang(card, i18n.language) : 'Select wanted card'}
        </button>
        <button className="flex-0" onClick={() => setSelectedCard(undefined)} disabled={selectedCard === undefined} type="button">
          <Trash2 className="mx-2 size-5" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button className="w-full" onClick={() => navigate(buildUrl(selectedCard, selectedLanguage))}>
          {card ? t('search.byCard', { cardName: getCardNameByLang(card, i18n.language) }) : t('search.allCards')}
        </Button>
      </div>
    </div>
  )
}
