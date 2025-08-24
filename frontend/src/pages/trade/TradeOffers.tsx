import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext'
import { fetchPublicAccount } from '@/lib/fetchAccount'
import type { AccountRow, TradeRow } from '@/types'
import TradeList from './TradeList'

function groupTrades(arr: TradeRow[], id: string) {
  return Object.groupBy(arr, (row) => {
    if (row.offering_friend_id === id) return row.receiving_friend_id
    if (row.receiving_friend_id === id) return row.offering_friend_id
    return 'undefined'
  })
}

interface TradePartnerProps {
  account: AccountRow
  friendId: string
  initialTrades: TradeRow[]
}

function TradePartner({ friendId, initialTrades }: TradePartnerProps) {
  const { t } = useTranslation('trade-matches')

  const [friendAccount, setFriendAccount] = useState<AccountRow | null>(null)
  const navigate = useNavigate()
  const [trades, setTrades] = useState<TradeRow[]>(initialTrades)
  const [viewHistory, setViewHistory] = useState<boolean>(false)

  async function update(id: number, fields: Partial<TradeRow>) {
    const now = new Date()
    const { error } = await supabase
      .from('trades')
      .update({ updated_at: now, ...fields })
      .eq('id', id)
    if (error) {
      console.log('Error updating trades: ', error)
      return
    }
    console.log('successfully updated trade')
    setTrades((arr) => arr.map((r) => (r.id === id ? { ...r, updated_at: now, ...fields } : r)))
  }

  useEffect(() => {
    if (!friendAccount) {
      fetchPublicAccount(friendId).then(setFriendAccount)
    }
  })

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 mx-1">
        <p>
          <span className="text-sm">{t('tradingWith')}</span>
          <span className="text-xl font-medium"> {friendAccount?.username || 'loading'} </span>
          <span className="text-xs">({friendId})</span>
        </p>
        <span className="flex gap-4">
          <label htmlFor={`history-${friendId}`} className="my-auto flex items-center">
            View history
            <Switch id={`history-${friendId}`} className="ml-2 my-auto" checked={viewHistory} onCheckedChange={setViewHistory} />
          </label>
          <Button className="my-auto" onClick={() => navigate(`/trade/${friendId}`)}>
            {t('openTradeWith')}
          </Button>
        </span>
      </div>
      {friendAccount !== null && <TradeList trades={trades} update={update} viewHistory={viewHistory} />}
    </div>
  )
}

function TradeOffers() {
  const { t } = useTranslation('trade-matches')

  const { account } = useContext(UserContext)
  const [trades, setTrades] = useState<TradeRow[] | null>(null)

  useEffect(() => {
    if (account && trades === null) {
      console.log('Refrehing trades')
      supabase
        .from('trades')
        .select()
        .then(({ data, error }) => {
          if (error) {
            console.log('Error fetching trades: ', error)
          } else {
            setTrades(data)
          }
        })
    }
  })

  if (trades === null || !account) {
    return null
  }

  if (trades.length === 0) return <p>{t('noTradeOffers')}</p>

  const friends = groupTrades(trades, account.friend_id)
  return (
    <div className="flex flex-col items-center mx-auto gap-12">
      {Object.keys(friends).map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} initialTrades={friends[friend_id] as TradeRow[]} account={account} />
      ))}
    </div>
  )
}

export default TradeOffers
