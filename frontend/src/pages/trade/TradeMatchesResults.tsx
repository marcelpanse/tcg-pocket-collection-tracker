import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { getCardByInternalId } from '@/lib/CardsDB'
import { groupTrades } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import { useFriends } from '@/services/friends/useFriends'
import { useActiveTrades, useTradingPartners } from '@/services/trade/useTrade'
import { type GameLanguage, gameLanguages, type TradePartners } from '@/types'

function PartnerRow({ partner, activeTrades, card_id }: { partner: TradePartners; activeTrades: number; card_id: number | undefined }) {
  const { t } = useTranslation('trade-matches')
  return (
    <Link to={`/trade/${partner.friend_id}`} state={{ friendCard: card_id }}>
      <div className="max-w-lg w-full min-h-14 flex justify-between items-center mx-auto px-4 py-1 rounded-md border border-neutral-700 bg-neutral-800 hover:bg-neutral-700">
        <p className="mr-2">
          <span>{partner.username}</span>
          {partner.language && <small className="bg-neutral-700 px-2 rounded-full ml-2">{partner.language}</small>}
        </p>
        <div className="flex items-center">
          <div>
            <p>{t('nMatches', { n: partner.trade_matches })}</p>
            {activeTrades > 0 && <p className="text-sm text-neutral-400 italic">{t('nPending', { n: activeTrades })}</p>}
          </div>
          <ChevronRight className="ml-2" />
        </div>
      </div>
    </Link>
  )
}

export default function TradeMatchesResults() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const [searchParams] = useSearchParams()
  const card_id = searchParams.has('card_id') ? Number(searchParams.get('card_id')) : undefined
  const languageRaw = searchParams.get('language') ?? undefined
  const language = languageRaw === undefined ? undefined : gameLanguages.includes(languageRaw as GameLanguage) ? (languageRaw as GameLanguage) : undefined

  const { data: account } = useAccount()
  const { data, isLoading } = useTradingPartners(card_id, language)
  const { data: trades } = useActiveTrades()
  const { data: friends = [] } = useFriends()

  const groupedTrades = trades !== undefined && account?.friend_id && groupTrades(trades, account.friend_id)

  if (card_id !== undefined && getCardByInternalId(card_id) === undefined) {
    throw new Error('Requested card was not found in the database')
  }

  if (isLoading || !groupedTrades) {
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
    return <p className="text-lg text-center px-2 py-8">{t('noTradePartners')}</p>
  }

  const friendIdSet = new Set(friends.filter((f) => f.state === 'accepted').map((f) => f.friend_id))
  const friendPartners = data.filter((p) => friendIdSet.has(p.friend_id))
  const otherPartners = data.filter((p) => !friendIdSet.has(p.friend_id))

  return (
    <div className="flex flex-col gap-2">
      {friendPartners.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 mt-2">Friends</p>
          {friendPartners.map((partner) => (
            <PartnerRow key={partner.friend_id} partner={partner} activeTrades={groupedTrades[partner.friend_id]?.length ?? 0} card_id={card_id} />
          ))}
          {otherPartners.length > 0 && <hr className="border-neutral-700 mx-4 my-1" />}
        </>
      )}
      {otherPartners.map((partner) => (
        <PartnerRow key={partner.friend_id} partner={partner} activeTrades={groupedTrades[partner.friend_id]?.length ?? 0} card_id={card_id} />
      ))}
    </div>
  )
}
