import { type Dispatch, type SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { incrementMultipleCards } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/Auth'
import { getCardById } from '@/lib/CardsDB'
import type { User } from '@/lib/context/UserContext'
import type { AccountRow, CollectionRow, TradeRow, TradeStatus } from '@/types'

interface Props {
  account: AccountRow
  trades: TradeRow[]
  setTrades: Dispatch<SetStateAction<TradeRow[]>>
  ownedCards: CollectionRow[]
  setOwnedCards: Dispatch<SetStateAction<CollectionRow[]>>
  user: User
}

function TradeList({ trades, setTrades, account, ownedCards, setOwnedCards, user }: Props) {
  const { t } = useTranslation('trade-matches')

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
    return (
      <>
        <Tooltip id={`tooltip-${row.id}`} />
        <span className={`rounded-full text-center w-9 ${style[row.status].color}`} data-tooltip-id={`tooltip-${row.id}`} data-tooltip-content={row.status}>
          {style[row.status].icon}
        </span>
      </>
    )
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
        <span className="text-neutral-400 ml-auto">×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
      </span>
    )
  }

  function Row({ row }: { row: TradeRow }) {
    const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
    const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id
    return (
      <li
        className={`flex cursor-pointer justify-between rounded gap-4 p-1 my-1 ${selectedTrade?.id === row.id && 'bg-green-900'} hover:bg-neutral-500`}
        onClick={() => onClick(row)}
      >
        {status(row)}
        {card(yourCard)}
        {card(friendCard)}
      </li>
    )
  }

  function update(row: TradeRow, status: TradeStatus) {
    const now = new Date()
    supabase
      .from('trades')
      .update({ status, updated_at: now })
      .eq('id', row.id)
      .then(({ error }) => {
        if (error) {
          console.log('Error updating trades: ', error)
        } else {
          setTrades((arr) => arr.map((r) => (r.id === row.id ? { ...r, status, updated_at: now } : r)))
          setSelectedTrade(null)
        }
      })
  }

  function end(row: TradeRow) {
    const obj =
      row.offering_friend_id === account.friend_id ? { offerer_ended: true } : row.receiving_friend_id === account.friend_id ? { receiver_ended: true } : null
    if (obj === null) {
      console.log(row, " doesn't match your friend_id")
      return
    }

    const now = new Date()
    supabase
      .from('trades')
      .update({ updated_at: now, ...obj })
      .eq('id', row.id)
      .then(({ error }) => {
        if (error) {
          console.log('Error updating trades: ', error)
        } else {
          setTrades((arr) => arr.filter((r) => r.id !== row.id))
          setSelectedTrade(null)
        }
      })
  }

  function increment(row: TradeRow) {
    if (row.offering_friend_id === account.friend_id) {
      incrementMultipleCards([row.offer_card_id], -1, ownedCards, setOwnedCards, user)
      incrementMultipleCards([row.receiver_card_id], 1, ownedCards, setOwnedCards, user)
    } else if (row.receiving_friend_id === account.friend_id) {
      incrementMultipleCards([row.offer_card_id], 1, ownedCards, setOwnedCards, user)
      incrementMultipleCards([row.receiver_card_id], -1, ownedCards, setOwnedCards, user)
    } else {
      console.log(row, "can't match friend id")
    }
  }

  function actions(row: TradeRow) {
    const i_ended = (row.offering_friend_id === account.friend_id && row.offerer_ended) || (row.receiving_friend_id === account.friend_id && row.receiver_ended)
    switch (row.status) {
      case 'offered':
        return (
          <>
            {row.receiving_friend_id === account.friend_id && (
              <Button type="button" onClick={() => update(row, 'accepted')}>
                Accept trade
              </Button>
            )}
            <Button
              type="button"
              onClick={() => {
                update(row, 'declined')
                end(row)
              }}
            >
              {row.receiving_friend_id === account.friend_id ? 'Decline trade' : 'Cancel trade'}
            </Button>
          </>
        )
      case 'accepted':
        return (
          <>
            <Button
              type="button"
              onClick={() => {
                update(row, 'finished')
              }}
            >
              Mark as complete
            </Button>
            <Button
              type="button"
              onClick={() => {
                update(row, 'declined')
                end(row)
              }}
            >
              Cancel
            </Button>
          </>
        )
      case 'declined':
        if (i_ended) return null
        return (
          <Button type="button" onClick={() => end(row)}>
            Hide from list
          </Button>
        )
      case 'finished':
        if (i_ended) return null
        return (
          <>
            <Button
              type="button"
              onClick={() => {
                increment(row)
                end(row)
              }}
            >
              Increment
            </Button>
            <Button type="button" onClick={() => end(row)}>
              Hide
            </Button>
          </>
        )
      default:
        console.log(`Unknown trade status ${selectedTrade?.status}`)
        return null
    }
  }
  const buttons = selectedTrade && actions(selectedTrade)

  if (trades.length === 0) return <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 text-center">No active trades</div>

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-2">
      <div className="flex gap-4 px-1">
        <div className="w-9" />
        <h4 className="text-lg font-medium w-1/2 pl-1">{t('youGive')}</h4>
        <h4 className="text-lg font-medium w-1/2 pl-1">{t('youReceive')}</h4>
      </div>
      <ul>
        {trades
          .toSorted((a, b) => (a.created_at > b.created_at ? -1 : 1))
          .map((x) => (
            <Row key={x.id} row={x} />
          ))}
      </ul>
      {buttons && <div className="flex gap-4 text-center items-center mt-2">{buttons}</div>}
    </div>
  )
}

export default TradeList
