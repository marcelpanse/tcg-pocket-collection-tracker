import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/Spinner'
import TradePartner from '@/pages/trade/components/TradePartner.tsx'
import { useAccount } from '@/services/account/useAccount'
import { useActiveTrades } from '@/services/trade/useTrade.ts'
import type { TradeRow } from '@/types'

function TradeOffers() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: trades, isLoading: isLoadingTrades } = useActiveTrades()

  if (isLoadingAccount || isLoadingTrades) {
    return <Spinner size="lg" overlay />
  }

  if (!trades || !account) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  if (trades.length === 0) {
    return <p>{t('noTradeOffers')}</p>
  }

  //split into two groups for finished and ongoing trades
  const friends = groupTrades(trades, account.friend_id)
  const friendsLastActivity = Object.fromEntries(
    Object.entries(friends).map(([key, value]) => [key, Math.max(...(value as TradeRow[]).map((row) => new Date(row.updated_at).getTime()))]),
  )
  const friendIds = Object.keys(friends).toSorted((a, b) => {
    return friendsLastActivity[b] - friendsLastActivity[a]
  })

  return (
    <div className="flex flex-col items-center mx-auto gap-6 sm:px-4 mb-12 w-full">
      {friendIds.map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} activeTrades={friends[friend_id] as TradeRow[]} />
      ))}
    </div>
  )
}

function groupTrades(arr: TradeRow[], id: string) {
  return Object.groupBy(arr, (row) => {
    if (row.offering_friend_id === id) {
      return row.receiving_friend_id
    } else if (row.receiving_friend_id === id) {
      return row.offering_friend_id
    } else {
      console.log('Fetched row does not match user friend_id', row)
      return 'undefined'
    }
  })
}

export default TradeOffers
