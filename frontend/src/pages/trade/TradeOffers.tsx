import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { fetchPublicAccount } from '@/lib/fetchAccount'
import type { AccountRow, CollectionRow, TradeRow } from '@/types'
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
  initialHistory: TradeRow[]
  ownedCards: CollectionRow[]
}

function TradeOffers() {
  const { t } = useTranslation('trade-matches')

  const { account, user } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  const [trades, setTrades] = useState<TradeRow[] | null>(null)

  useEffect(() => {
    if (account && trades === null) {
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

  if (trades === null || !account) return null

  function TradePartner({ friendId, initialTrades, initialHistory, account, ownedCards }: TradePartnerProps) {
    const [friendAccount, setFriendAccount] = useState<AccountRow | null>(null)
    const navigate = useNavigate()
    const [trades, setTrades] = useState<TradeRow[]>(initialTrades)
    const [history, setHistory] = useState<TradeRow[]>(initialHistory)
    const [viewHistory, setViewHistory] = useState<boolean>(false)

    useEffect(() => {
      if (!friendAccount) fetchPublicAccount(friendId).then(setFriendAccount)
    })

    if (!user) return <p>User not logged in</p>

    console.log(viewHistory, initialTrades, history)

    // TODO: fix completed trades not appearing in history
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
        {friendAccount !== null && (
          <TradeList
            account={account}
            trades={viewHistory ? history : trades}
            setTrades={viewHistory ? setHistory : setTrades}
            ownedCards={ownedCards}
            setOwnedCards={setOwnedCards}
            user={user}
          />
        )}
      </div>
    )
  }

  if (trades.length === 0) return <p>{t('noTradeOffers')}</p>

  function interesting(row: TradeRow) {
    return (row.offering_friend_id === account?.friend_id && !row.offerer_ended) || (row.receiving_friend_id === account?.friend_id && !row.receiver_ended)
  }

  const friends = groupTrades(trades, account.friend_id)
  return (
    <div className="flex flex-col items-center mx-auto gap-12">
      {Object.keys(friends).map((friend_id) => (
        <TradePartner
          key={friend_id}
          friendId={friend_id}
          initialTrades={(friends[friend_id] as TradeRow[]).filter(interesting)}
          initialHistory={(friends[friend_id] as TradeRow[]).filter((x) => !interesting(x))}
          account={account}
          ownedCards={ownedCards}
        />
      ))}
    </div>
  )
}

export default TradeOffers
