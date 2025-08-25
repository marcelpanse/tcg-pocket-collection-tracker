import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { incrementMultipleCards } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast.ts'
import { getCardById } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { TradeRow, TradeStatus } from '@/types'

interface Props {
  trades: TradeRow[]
  update: (id: number, fields: Partial<TradeRow>) => Promise<void>
  viewHistory: boolean
}

function TradeList({ trades: allTrades, update, viewHistory }: Props) {
  const { t } = useTranslation('trade-matches')
  const { toast } = useToast()

  function interesting(row: TradeRow) {
    return (row.offering_friend_id === account?.friend_id && !row.offerer_ended) || (row.receiving_friend_id === account?.friend_id && !row.receiver_ended)
  }

  const { ownedCards, setOwnedCards } = useContext(CollectionContext)
  const { account, user } = useContext(UserContext)
  const trades = viewHistory ? allTrades.filter((x) => !interesting(x)) : allTrades.filter(interesting)
  const [selectedTradeId, setSelectedTradeId] = useState<number | undefined>(undefined)

  if (!account || !user) return null

  function onClick(row: TradeRow) {
    if (selectedTradeId === row.id) {
      setSelectedTradeId(undefined)
    } else {
      setSelectedTradeId(row.id)
    }
  }

  const status = (row: TradeRow) => {
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

  const Row = ({ row }: { row: TradeRow }) => {
    const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
    const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id
    return (
      <li
        className={`flex cursor-pointer justify-between rounded gap-4 p-1 my-1 ${selectedTradeId === row.id && 'bg-green-900'} hover:bg-neutral-500`}
        onClick={() => onClick(row)}
      >
        {status(row)}
        {card(yourCard)}
        {card(friendCard)}
      </li>
    )
  }

  const increment = async (row: TradeRow) => {
    if (row.offering_friend_id === account.friend_id) {
      await incrementMultipleCards([row.offer_card_id], -1, ownedCards, setOwnedCards, user)
      await incrementMultipleCards([row.receiver_card_id], 1, ownedCards, setOwnedCards, user)
      toast({ title: t('collectionUpdated'), variant: 'default' })
    } else if (row.receiving_friend_id === account.friend_id) {
      await incrementMultipleCards([row.offer_card_id], 1, ownedCards, setOwnedCards, user)
      await incrementMultipleCards([row.receiver_card_id], -1, ownedCards, setOwnedCards, user)
      toast({ title: t('collectionUpdated'), variant: 'default' })
    } else {
      console.log(row, "can't match friend id")
    }
  }

  const actions = (row: TradeRow) => {
    const updateStatus = async (status: TradeStatus) => {
      await update(row.id, { status: status })
      setSelectedTradeId(row.id)
    }

    const end = async () => {
      const obj =
        row.offering_friend_id === account.friend_id ? { offerer_ended: true } : row.receiving_friend_id === account.friend_id ? { receiver_ended: true } : null
      if (obj === null) {
        console.log(row, " doesn't match your friend_id")
        return
      }
      await update(row.id, obj)
      setSelectedTradeId(undefined)
    }

    const i_ended = (row.offering_friend_id === account.friend_id && row.offerer_ended) || (row.receiving_friend_id === account.friend_id && row.receiver_ended)
    switch (row.status) {
      case 'offered':
        return (
          <>
            {row.receiving_friend_id === account.friend_id && (
              <Button type="button" onClick={async () => updateStatus('accepted')}>
                {t('actionAccept')}
              </Button>
            )}
            <Button type="button" onClick={async () => updateStatus('declined')}>
              {row.receiving_friend_id === account.friend_id ? t('actionDecline') : t('actionCancel')}
            </Button>
          </>
        )
      case 'accepted':
        return (
          <>
            <Button type="button" onClick={async () => updateStatus('finished')}>
              {t('actionComplete')}
            </Button>
            <Button type="button" onClick={async () => updateStatus('declined')}>
              {t('actionCancel')}
            </Button>
          </>
        )
      case 'declined':
        if (i_ended) return null
        return (
          <Button type="button" onClick={end}>
            {t('actionHide')}
          </Button>
        )
      case 'finished':
        if (i_ended) return null
        return (
          <>
            <Button
              type="button"
              onClick={async () => {
                await increment(row)
                await end()
              }}
            >
              {t('actionUpdate')}
            </Button>
            <Button type="button" onClick={end}>
              {t('actionHide')}
            </Button>
          </>
        )
      default:
        console.log(`Unknown trade status ${row.status}`)
        return null
    }
  }

  const selectedTrade = trades.find((r) => r.id === selectedTradeId)

  if (trades.length === 0) return <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 text-center">{t('noActiveTrades')}</div>

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
      {selectedTrade && <div className="flex gap-4 text-center items-center mt-2">{actions(selectedTrade)}</div>}
    </div>
  )
}

export default TradeList
