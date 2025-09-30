import { useTranslation } from 'react-i18next'
import TradePartner from '@/pages/trade/components/TradePartner.tsx'
import { useAccount } from '@/services/account/useAccount'
import { useTrades } from '@/services/trade/useTrade.ts'
import type { TradeRow } from '@/types'

function TradeOffers() {
  const { t } = useTranslation('trade-matches')

  const { data: account } = useAccount()
  const { data: trades } = useTrades()

  if (!trades || !account) {
    return null
  }

  if (trades.length === 0) {
    return <p>{t('noTradeOffers')}</p>
  }

  //split into two groups for finished and ongoing trades
  const friends = groupTrades(trades, account.friend_id)
  const friendsLastActivity = Object.fromEntries(
    Object.entries(friends).map(([key, value]) => [key, Math.max(...(value as TradeRow[]).map((row) => new Date(row.updated_at).getTime()))]),
  )
  const friendIds = Object.keys(friends).toSorted((a, b) => friendsLastActivity[b] - friendsLastActivity[a])

  const friendsFinished = groupTrades(trades, account.friend_id, true)
  const friendsFinishedLastActivity = Object.fromEntries(
    Object.entries(friendsFinished).map(([key, value]) => [key, Math.max(...(value as TradeRow[]).map((row) => new Date(row.updated_at).getTime()))]),
  )
  const finishedIds = Object.keys(friendsFinished).toSorted((a, b) => friendsFinishedLastActivity[b] - friendsFinishedLastActivity[a])

  return (
    <div className="flex flex-col items-center mx-auto gap-12 sm:px-4 mb-12 w-full">
      {friendIds.map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} />
      ))}
      {finishedIds.map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} />
      ))}
    </div>
  )
}

function groupTrades(arr: TradeRow[], id: string, finishedTradesOnly = false) {
  const filtered = arr.filter((row) => {
    if (finishedTradesOnly) {
      if (row.offering_friend_id === id) {
        return row.offerer_ended
      } else {
        return row.receiver_ended
      }
    } else {
      if (row.offering_friend_id === id) {
        return !row.offerer_ended
      } else {
        return !row.receiver_ended
      }
    }
  })

  return Object.groupBy(filtered, (row) => {
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
