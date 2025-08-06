import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { fetchPublicAccount } from '@/lib/fetchAccount'
import type { AccountRow, CollectionRow, TradeRow } from '@/types'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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
  ownedCards: CollectionRow[]
}

function TradeOffers() {
  const { t } = useTranslation('trade-matches')

  const { account } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)

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

  function TradePartner({ friendId, initialTrades, account, ownedCards }: TradePartnerProps) {
    const [friendAccount, setFriendAccount] = useState<AccountRow | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
      if (!friendAccount) fetchPublicAccount(friendId).then(setFriendAccount)
    })

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1 mx-1">
          <p>
            <span className="text-sm">{t('tradingWith')}</span>
            <span className="text-xl font-medium"> {friendAccount?.username || 'loading'} </span>
            <span className="text-xs">({friendId})</span>
          </p>
          <Button className="ml-auto" onClick={() => navigate(`/trade/${friendId}`)}>
            {t('openTradeWith')}
          </Button>
        </div>
        {friendAccount !== null && <TradeList account={account} initialTrades={initialTrades} ownedCards={ownedCards} />}
      </div>
    )
  }

  function content(trades: TradeRow[], account: AccountRow) {
    const friends = groupTrades(trades, account.friend_id)
    return (
      <>
        {Object.keys(friends).map((friend_id) => (
          <TradePartner key={friend_id} friendId={friend_id} initialTrades={friends[friend_id] as TradeRow[]} account={account} ownedCards={ownedCards} />
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto gap-12">
      {trades === null || !account ? <p>Loading...</p> : trades.length === 0 ? <p>{t('noTradeOffers')}</p> : content(trades, account)}
    </div>
  )
}

export default TradeOffers
