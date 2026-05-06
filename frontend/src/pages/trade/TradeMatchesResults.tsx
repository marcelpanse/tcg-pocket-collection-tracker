import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { getCardByInternalId } from '@/lib/CardsDB'
import { useFriends } from '@/services/friends/useFriends'
import { useTradingPartners } from '@/services/trade/useTrade'
import { type GameLanguage, gameLanguages, type TradePartners } from '@/types'

function PartnerRow({ partner, card_id }: { partner: TradePartners; card_id: number | undefined }) {
  const { t } = useTranslation('trade-matches')
  return (
    <div className="max-w-md w-full flex justify-between items-center mx-auto px-4">
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
  )
}

export default function TradeMatchesResults() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const [searchParams] = useSearchParams()
  const card_id = searchParams.has('card_id') ? Number(searchParams.get('card_id')) : undefined
  const languageRaw = searchParams.get('language') ?? undefined
  const language = languageRaw === undefined ? undefined : gameLanguages.includes(languageRaw as GameLanguage) ? (languageRaw as GameLanguage) : undefined

  const { data, isLoading } = useTradingPartners(card_id, language)
  const { data: friends = [] } = useFriends()

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

  const friendIdSet = new Set(friends.filter((f) => f.state === 'accepted').map((f) => f.friend_id))
  const friendPartners = data.filter((p) => friendIdSet.has(p.friend_id))
  const otherPartners = data.filter((p) => !friendIdSet.has(p.friend_id))

  return (
    <div className="flex flex-col gap-4">
      {friendPartners.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 mt-2">Friends</p>
          {friendPartners.map((partner) => (
            <PartnerRow key={partner.friend_id} partner={partner} card_id={card_id} />
          ))}
          {otherPartners.length > 0 && <hr className="border-neutral-700 mx-4 my-1" />}
        </>
      )}
      {otherPartners.map((partner) => (
        <PartnerRow key={partner.friend_id} partner={partner} card_id={card_id} />
      ))}
    </div>
  )
}
