import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast.ts'
import { umami } from '@/lib/utils.ts'
import { TradeListRow } from '@/pages/trade/components/TradeListRow.tsx'
import { useAccount } from '@/services/account/useAccount'
import { useCollection, useUpdateCards } from '@/services/collection/useCollection'
import { useUpdateTrade } from '@/services/trade/useTrade.ts'
import type { CollectionRowUpdate, TradeRow, TradeStatus } from '@/types'

interface Props {
  trades: TradeRow[]
  viewHistory: boolean
}

function TradeList({ trades, viewHistory }: Props) {
  const { t } = useTranslation('trade-matches')
  const { toast } = useToast()

  const { data: account } = useAccount()
  const { data: ownedCards = [] } = useCollection()
  const updateCardsMutation = useUpdateCards()

  function interesting(row: TradeRow) {
    return (row.offering_friend_id === account?.friend_id && !row.offerer_ended) || (row.receiving_friend_id === account?.friend_id && !row.receiver_ended)
  }
  const filteredTrades = viewHistory ? trades.filter((x) => !interesting(x)) : trades.filter(interesting)
  const [selectedTradeId, setSelectedTradeId] = useState<number | undefined>(undefined)
  const updateTradeMutation = useUpdateTrade()

  if (!account) {
    return null
  }

  const getAndIncrement = (card_id: string, increment: number): CollectionRowUpdate => {
    return { card_id, amount_owned: (ownedCards.find((r) => r.card_id === card_id)?.amount_owned ?? 0) + increment }
  }

  const increment = async (row: TradeRow) => {
    if (row.offer_card_id === row.receiver_card_id) {
      return
    }

    if (row.offering_friend_id === account.friend_id) {
      const updates = [getAndIncrement(row.offer_card_id, -1), getAndIncrement(row.receiver_card_id, 1)]
      updateCardsMutation.mutate({ updates })
      toast({ title: t('collectionUpdated'), variant: 'default' })
    } else if (row.receiving_friend_id === account.friend_id) {
      const updates = [getAndIncrement(row.offer_card_id, 1), getAndIncrement(row.receiver_card_id, -1)]
      updateCardsMutation.mutate({ updates })
      toast({ title: t('collectionUpdated'), variant: 'default' })
    } else {
      console.log(row, "can't match friend id")
    }
  }

  const actions = (row: TradeRow) => {
    const updateStatus = async (status: TradeStatus) => {
      updateTradeMutation.mutate({ id: row.id, trade: { status: status } })
      setSelectedTradeId(row.id)
      umami(`Updated trade: ${status}`)
    }

    const end = async () => {
      const trade =
        row.offering_friend_id === account.friend_id ? { offerer_ended: true } : row.receiving_friend_id === account.friend_id ? { receiver_ended: true } : null
      if (trade === null) {
        console.log(row, " doesn't match your friend_id")
        return
      }
      updateTradeMutation.mutate({ id: row.id, trade })

      setSelectedTradeId(undefined)
      umami('Updated trade: ended')
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
        if (i_ended) {
          return null
        }
        return (
          <Button type="button" onClick={end}>
            {t('actionHide')}
          </Button>
        )
      case 'finished':
        if (i_ended) {
          return null
        }
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

  const selectedTrade = filteredTrades.find((r) => r.id === selectedTradeId)

  if (filteredTrades.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-1 sm:p-2">
      <div className="hidden sm:flex px-1">
        <div className="w-9" />
        <h4 className="text-lg font-medium w-1/2 ml-8">{t('youGive')}</h4>
        <h4 className="text-lg font-medium w-1/2 ml-8">{t('youReceive')}</h4>
      </div>
      <ul className="flex flex-col gap-2 sm:gap-0">
        {filteredTrades
          .toSorted((a, b) => (a.created_at > b.created_at ? -1 : 1))
          .map((x) => (
            <TradeListRow key={x.id} row={x} selectedTradeId={selectedTradeId} setSelectedTradeId={setSelectedTradeId} />
          ))}
      </ul>
      {selectedTrade && <div className="flex gap-4 text-center items-center mt-2">{actions(selectedTrade)}</div>}
    </div>
  )
}

export default TradeList
