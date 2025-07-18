import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/Auth'
import { getCardById } from '@/lib/CardsDB'
import type { AccountRow, CollectionRow, TradeRow, TradeStatus } from '@/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  account: AccountRow
  initialTrades: TradeRow[]
  ownedCards: CollectionRow[]
}

function TradeList({ initialTrades, account, ownedCards }: Props) {
  const { t } = useTranslation('trade-matches')

  const [trades, setTrades] = useState(initialTrades)
  const [selectedTrade, setSelectedTrade] = useState<TradeRow | null>(null)

  function onClick(row: TradeRow) {
    if (selectedTrade?.id === row.id) {
      setSelectedTrade(null)
    } else {
      setSelectedTrade(row)
    }
  }

  function status(row: TradeRow) {
    const style = {
      offered: { icon: row.offering_friend_id === account.friend_id ? '→' : '←', color: 'bg-amber-600' },
      accepted: { icon: '↔', color: 'bg-lime-600' },
      declined: { icon: 'X', color: 'bg-stone-600' },
      finished: { icon: '✓', color: 'bg-indigo-600' },
    }
    return <span className={`rounded-full text-center w-9 ${style[row.status].color}`}>{style[row.status].icon}</span>
  }

  function card(card_id: string) {
    const card = getCardById(card_id)
    if (!card) {
      return <span className="w-1/2 text-center">?</span>
    }
    return (
      <span className="flex rounded px-1 w-1/2 bg-zinc-800">
        <span className="min-w-10">{card.rarity} </span>
        <span className="min-w-14 me-4">{card.card_id} </span>
        <span>{card.name}</span>
        <span className="text-gray-400 ml-auto">×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
      </span>
    )
  }

  function row(row: TradeRow) {
    const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
    const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id
    return (
      <li
        key={row.id}
        className={`flex justify-between rounded gap-4 p-1 my-1 ${selectedTrade?.id === row.id && 'bg-green-900'} hover:bg-gray-500`}
        onClick={() => onClick(row)}
      >
        {status(row)}
        {card(yourCard)}
        {card(friendCard)}
      </li>
    )
  }

  function update(status: TradeStatus) {
    if (!selectedTrade) {
      console.log("Can't update without selected trade")
      return
    }

    const now = new Date()
    supabase
      .from('trades')
      .update({ status, updated_at: now })
      .eq('id', selectedTrade.id)
      .then(({ error }) => {
        if (error) {
          console.log('Error updating trades: ', error)
        } else {
          setTrades((arr) => arr.map((row) => (selectedTrade.id === row.id ? { ...row, status, updated_at: now } : row)))
          setSelectedTrade({ ...selectedTrade, status, updated_at: now })
          if (status === 'finished') {
            console.log('Modyfing collection implemented yet')
          }
        }
      })
  }

  return (
    <div className="border rounded p-2">
      <div className="flex justify-between mb-2 px-4">
        <h4 className="text-lg font-medium ml-12">{t('youGive')}</h4>
        <h4 className="text-lg font-medium">{t('youReceive')}</h4>
      </div>
      <ul>{trades.toSorted((a, b) => (a.created_at > b.created_at ? -1 : 1)).map(row)}</ul>
      <div className="flex justify-between text-center items-center mt-4">
        <Button
          className="w-1/4"
          type="button"
          onClick={() => update('accepted')}
          disabled={!selectedTrade || selectedTrade.status !== 'offered' || selectedTrade.receiving_friend_id !== account.friend_id}
        >
          Accept
        </Button>
        <Button
          className="w-1/4"
          type="button"
          onClick={() => update('declined')}
          disabled={!selectedTrade || (selectedTrade.status !== 'offered' && selectedTrade.status !== 'accepted')}
        >
          Decline
        </Button>
        <Button className="w-1/4" type="button" onClick={() => update('finished')} disabled={!selectedTrade || selectedTrade.status !== 'accepted'}>
          Mark as complete
        </Button>
      </div>
    </div>
  )
}

export default TradeList
