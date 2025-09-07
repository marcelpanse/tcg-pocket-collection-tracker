import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAccount, usePublicAccount } from '@/services/account/useAccount'
import { useUser } from '@/services/auth/useAuth'
import { useTrades, useUpdateTrade } from '@/services/trade/useTrade.ts'
import type { TradeRow } from '@/types'
import TradeList from './TradeList'

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

  const friends = groupTrades(trades, account.friend_id)
  const friendsLastActivity = Object.fromEntries(
    Object.entries(friends).map(([key, value]) => [key, Math.max(...(value as TradeRow[]).map((row) => new Date(row.updated_at).getTime()))]),
  )
  const friendIds = Object.keys(friends).toSorted((a, b) => friendsLastActivity[b] - friendsLastActivity[a])

  return (
    <div className="flex flex-col items-center mx-auto gap-12 sm:px-4 mb-12">
      {friendIds.map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} />
      ))}
    </div>
  )
}

interface TradePartnerProps {
  friendId: string
}

function TradePartner({ friendId }: TradePartnerProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('trade-matches')

  const { data: user } = useUser()
  const { data: trades } = useTrades()
  const { data: friendAccount } = usePublicAccount(user?.user.email)
  const updateTradeMutation = useUpdateTrade()

  const [viewHistory, setViewHistory] = useState<boolean>(false)

  async function update(id: number, trade: Partial<TradeRow>) {
    updateTradeMutation.mutate({ id, trade })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 mx-1">
        <p>
          <span className="text-md">{t('tradingWith')}</span>
          <span className="text-md font-bold"> {friendAccount?.username || 'loading'} </span>
        </p>
        <span className="flex gap-4">
          <label htmlFor={`history-${friendId}`} className="my-auto flex items-center">
            {t('viewHistory')}
            <Switch id={`history-${friendId}`} className="ml-2 my-auto" checked={viewHistory} onCheckedChange={setViewHistory} />
          </label>
          <Button className="my-auto" onClick={() => navigate(`/trade/${friendId}`)}>
            {t('openTradeWith')}
          </Button>
        </span>
      </div>
      {friendAccount !== null && trades && <TradeList trades={trades} update={update} viewHistory={viewHistory} />}
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
