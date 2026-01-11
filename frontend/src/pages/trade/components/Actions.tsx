import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getInteralIdByCardId } from '@/lib/CardsDB'
import { umami } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import { useCollection, useUpdateCards } from '@/services/collection/useCollection'
import { useUpdateTrade } from '@/services/trade/useTrade'
import type { CardAmountUpdate, TradeRow, TradeStatus } from '@/types'

interface Props {
  trade: TradeRow
  setSelected: Dispatch<SetStateAction<number | undefined>>
}

export default function Actions({ trade, setSelected }: Props) {
  const { t } = useTranslation('trade-matches')
  const { toast } = useToast()

  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: ownedCards, isLoading: isLoadingCollection } = useCollection()
  const updateCardsMutation = useUpdateCards()
  const updateTradeMutation = useUpdateTrade()

  if (isLoadingAccount || isLoadingCollection) {
    return null
  }

  if (!account || !ownedCards) {
    throw new Error('Cannot deduce trade actions: not logged in')
  }

  const getAndIncrement = (card_id: string, increment: number): CardAmountUpdate => {
    const internal_id = getInteralIdByCardId(card_id)
    return { card_id, internal_id, amount_owned: (ownedCards.get(internal_id)?.amount_owned ?? 0) + increment }
  }

  const end = async () => {
    const update =
      trade.offering_friend_id === account.friend_id
        ? { offerer_ended: true }
        : trade.receiving_friend_id === account.friend_id
          ? { receiver_ended: true }
          : null
    if (update === null) {
      throw new Error(`Error hiding trade: cannot match your friend id`)
    }
    await updateTradeMutation.mutateAsync({ id: trade.id, trade: update })

    setSelected(undefined)
    umami('Updated trade: ended')
  }

  const increment = async () => {
    if (trade.offer_card_id === trade.receiver_card_id) {
      return
    }

    const updates =
      trade.offering_friend_id === account.friend_id
        ? [getAndIncrement(trade.offer_card_id, -1), getAndIncrement(trade.receiver_card_id, 1)]
        : trade.receiving_friend_id === account.friend_id
          ? [getAndIncrement(trade.offer_card_id, 1), getAndIncrement(trade.receiver_card_id, -1)]
          : null
    if (updates === null) {
      throw new Error(`Error updating collection: cannot match your friend id`)
    }

    await updateCardsMutation.mutateAsync(updates)
    await end()
    toast({ title: t('collectionUpdated'), variant: 'default' })
  }

  const updateStatus = async (status: TradeStatus) => {
    updateTradeMutation.mutate({ id: trade.id, trade: { status: status } })
    setSelected(trade.id)
    umami(`Updated trade: ${status}`)
  }

  const i_ended =
    (trade.offering_friend_id === account.friend_id && trade.offerer_ended) || (trade.receiving_friend_id === account.friend_id && trade.receiver_ended)

  switch (trade.status) {
    case 'offered':
      return (
        <>
          {trade.receiving_friend_id === account.friend_id && <Button onClick={() => updateStatus('accepted')}>{t('actionAccept')}</Button>}
          <Button onClick={() => updateStatus('declined')}>{trade.receiving_friend_id === account.friend_id ? t('actionDecline') : t('actionCancel')}</Button>
        </>
      )
    case 'accepted':
      return (
        <>
          <Button onClick={() => updateStatus('finished')}>{t('actionComplete')}</Button>
          <Button onClick={() => updateStatus('declined')}>{t('actionCancel')}</Button>
        </>
      )
    case 'declined':
      if (i_ended) {
        return null
      }
      return <Button onClick={end}>{t('actionHide')}</Button>
    case 'finished':
      if (i_ended) {
        return null
      }
      return (
        <>
          <Button onClick={() => increment()}>{t('actionUpdate')}</Button>
          <Button onClick={end}>{t('actionHide')}</Button>
        </>
      )
    default:
      console.log(`Unknown trade status ${trade.status}`)
      return null
  }
}
