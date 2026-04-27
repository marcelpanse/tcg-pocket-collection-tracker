import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { useTradingPartners } from '@/services/trade/useTrade'
import { type GameLanguage, gameLanguages } from '@/types'

export default function TradeMatchesResults() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const [searchParams] = useSearchParams()
  const card_id = searchParams.has('card_id') ? Number(searchParams.get('card_id')) : undefined
  const languageRaw = searchParams.get('language') ?? undefined
  const language = languageRaw === undefined ? undefined : gameLanguages.includes(languageRaw as GameLanguage) ? (languageRaw as GameLanguage) : undefined

  const { data, isLoading } = useTradingPartners(card_id, language)

  if (card_id !== undefined && getCardByInternalId(card_id) === undefined) {
    throw new Error('Requested card was not found in the database')
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

  if (!data) {
    return <ErrorAlert />
  }

  if (data.length === 0) {
    return <p className="text-xl text-center py-8">{t('noTradePartners')}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((partner) => (
        <div key={partner.friend_id} className="max-w-md w-full flex justify-between items-center mx-auto px-4">
          <p className="mr-2">
            <span>{partner.username}</span>
            {partner.language && <small className="bg-neutral-800 px-2 rounded-full ml-1">{partner.language}</small>}
          </p>
          <Link to={`/trade/${partner.friend_id}`} state={{ friendCard: card_id }}>
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
