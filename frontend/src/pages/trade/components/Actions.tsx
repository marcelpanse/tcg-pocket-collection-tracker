import { useQueryClient } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectCardContext } from '@/components/SelectCard'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getCardById, getCardByInternalId, getInternalIdByCardId } from '@/lib/CardsDB'
import { getExtraCards, getNeededCards, getTradeCards, umami } from '@/lib/utils'
import { publicAccountQuery, useAccount } from '@/services/account/useAccount'
import { publicCollectionQuery, useCollection, useUpdateCards } from '@/services/collection/useCollection'
import { useUpdateTrade } from '@/services/trade/useTrade'
import type { CardAmountUpdate, TradableRarity, TradeRow, TradeStatus } from '@/types'

interface Props {
  trade: TradeRow
  setSelected: Dispatch<SetStateAction<number | undefined>>
}

export default function Actions({ trade, setSelected }: Props) {
  const { t } = useTranslation('trade-matches')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { selectCard } = useContext(SelectCardContext)

  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: ownedCards, isLoading: isLoadingCollection } = useCollection()
  const updateCardsMutation = useUpdateCards()
  const updateTradeMutation = useUpdateTrade()
  const [fetchingSelectCard, setFetchingSelectCard] = useState(false)

  if (isLoadingAccount || isLoadingCollection) {
    return null
  }

  if (!account || !ownedCards) {
    throw new Error('Cannot deduce trade actions: not logged in')
  }

  const getAndIncrement = (card_id: string, increment: number): CardAmountUpdate => {
    const internal_id = getInternalIdByCardId(card_id)
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
    if (!trade.offer_card_id || !trade.receiver_card_id) {
      throw new Error(`Can't increment trade without cards`)
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
      if (!trade.offer_card_id || !trade.receiver_card_id) {
        const friendFriendId = trade.offering_friend_id === account.friend_id ? trade.receiving_friend_id : trade.offering_friend_id
        const choosingTheirCard = trade.offering_friend_id === account.friend_id ? trade.receiver_card_id === null : trade.offer_card_id === null
        const callback = async (internal_id: number) => {
          const card = getCardByInternalId(internal_id)
          if (!card) {
            throw new Error(`Unrecognized internal id: ${internal_id}`)
          }
          const swap = trade.receiving_friend_id === account.friend_id
          const { id, ...newTrade } = swap ? swapSides(trade) : { ...trade }
          if (choosingTheirCard) {
            newTrade.receiver_card_id = card.card_id
          } else {
            newTrade.offer_card_id = card.card_id
          }
          await updateTradeMutation.mutateAsync({ id, trade: newTrade })
        }
        const onSelect = async () => {
          setFetchingSelectCard(true)
          const [friendAccount, friendCards] = await Promise.all([
            queryClient.ensureQueryData(publicAccountQuery(friendFriendId)),
            queryClient.ensureQueryData(publicCollectionQuery(friendFriendId)),
          ])
          if (!friendAccount || !friendCards) {
            throw new Error('Failed selecting card: failed to load accounts')
          }
          const existingCardId = trade.offer_card_id === null ? trade.receiver_card_id : trade.offer_card_id
          const rarity = existingCardId && getCardById(existingCardId)?.rarity
          if (!rarity) {
            throw new Error('Failed selecting card: could not recognize existing card')
          }
          const cardsToSelect = choosingTheirCard
            ? getTradeCards(
                getExtraCards(friendCards, friendAccount.trade_rarity_settings ?? []),
                getNeededCards(ownedCards, account.trade_rarity_settings ?? []),
              )
            : getTradeCards(
                getExtraCards(ownedCards, account.trade_rarity_settings ?? []),
                getNeededCards(friendCards, friendAccount.trade_rarity_settings ?? []),
              )
          setFetchingSelectCard(false)
          selectCard({ cards: cardsToSelect?.[rarity as TradableRarity] ?? [], callback })
        }
        return (
          <>
            <Button onClick={onSelect} isPending={fetchingSelectCard}>
              Select card
            </Button>
            <Button onClick={() => updateStatus('declined')}>{trade.receiving_friend_id === account.friend_id ? t('actionDecline') : t('actionCancel')}</Button>
          </>
        )
      }
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
      throw new Error(`Unknown trade status ${trade.status}`)
  }
}

function swapSides(trade: TradeRow): TradeRow {
  return {
    ...trade,
    offering_friend_id: trade.receiving_friend_id,
    receiving_friend_id: trade.offering_friend_id,
    offer_card_id: trade.receiver_card_id,
    receiver_card_id: trade.offer_card_id,
    offerer_ended: trade.receiver_ended,
    receiver_ended: trade.offerer_ended,
  }
}
