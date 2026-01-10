import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { useTradingPartners } from '@/services/trade/useTrade'

export default function TradeMatchesResults() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const [searchParams] = useSearchParams()
  const card_id = searchParams.has('card_id') ? Number(searchParams.get('card_id')) : undefined

  const { data, isLoading } = useTradingPartners(card_id)

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

  const linkSuffix = card_id ? `?friend_card=${card_id}` : ''
  return (
    <div className="flex flex-col gap-4">
      {data.map((partner) => (
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
