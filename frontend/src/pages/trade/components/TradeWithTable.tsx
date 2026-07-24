import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Spinner } from '@/components/Spinner'
import { getCardByInternalId } from '@/lib/CardsDB'
import { getExtraCards, getNeededCards, getTradeCards } from '@/lib/utils'
import { publicCollectionQuery, useCollection } from '@/services/collection/useCollection'
import { type Card, type PublicAccountRow, type TradableRarity, tradableRarities } from '@/types'
import { CardList } from './CardList'
import { TradeOffer } from './TradeOffer'

interface Props {
  ownAccount: PublicAccountRow
  friendAccount: PublicAccountRow
}

export default function TradeWithTable({ ownAccount, friendAccount }: Props) {
  const { t } = useTranslation(['trade-matches', 'common'])
  const location = useLocation()

  const { data: ownedCards, isLoading: isLoadingOwnCards } = useCollection()
  const { data: friendCards, isLoading: isLoadingFriendCards } = useQuery(publicCollectionQuery(friendAccount.friend_id))

  const [yourCard, setYourCard] = useState<Card | null>(null)
  const [friendCard, setFriendCard] = useState<Card | null>(
    location.state?.friendCard === undefined ? null : (getCardByInternalId(location.state.friendCard) ?? null),
  )

  useEffect(() => {
    const id = location.state?.friendCard
    if (!id || !friendCards || !ownedCards) {
      return
    }
    const card = getCardByInternalId(id)
    if (!card) {
      return
    }
    const el = document.getElementById(card.rarity)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location, friendCards, ownedCards?.size]) // Uses size because ReactQuery returns a different object every 10 seconds

  if (isLoadingOwnCards || isLoadingFriendCards) {
    return <Spinner size="lg" className="mx-auto mt-8" />
  }

  if (ownedCards === undefined || friendCards === undefined) {
    return <ErrorAlert />
  }

  const cardsToGive = getTradeCards(
    getExtraCards(ownedCards, ownAccount.trade_rarity_settings ?? []),
    getNeededCards(friendCards, friendAccount.trade_rarity_settings ?? []),
  )
  const cardsToReceive = getTradeCards(
    getExtraCards(friendCards, friendAccount.trade_rarity_settings ?? []),
    getNeededCards(ownedCards, ownAccount.trade_rarity_settings ?? []),
  )

  const hasPossibleTrades = tradableRarities.some((r) => (cardsToGive[r] ?? []).length > 0 && (cardsToReceive[r] ?? []).length > 0)

  const canSendOffer =
    (!yourCard && friendCard && !!cardsToGive[friendCard.rarity as TradableRarity]) || (yourCard && friendCard && yourCard.rarity === friendCard.rarity)

  return (
    <>
      <TradeOffer
        yourId={ownAccount.friend_id}
        friendId={friendAccount.friend_id}
        yourCard={yourCard}
        friendCard={friendCard}
        setYourCard={setYourCard}
        setFriendCard={setFriendCard}
        disabled={!canSendOffer}
      />

      {!hasPossibleTrades && (
        <div className="text-center py-8">
          <p className="text-xl ">{t('noPossibleTrades')}</p>
          <p className="text-sm text-gray-300 mt-2">{t('noPossibleTradesDescription')}</p>
        </div>
      )}

      {tradableRarities.map(
        (rarity) =>
          (cardsToGive[rarity] || cardsToReceive[rarity]) && (
            <div key={rarity}>
              <h3 id={rarity} className="text-xl font-semibold mb-2 text-center">
                [ {rarity} ]
              </h3>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                <div className="w-full sm:w-1/2 p-1 border rounded-lg border-neutral-700 bg-neutral-800">
                  <h4 className="text-md font-medium mb-1 ml-1 text-neutral-400">{t('youHave')}</h4>
                  {cardsToGive[rarity] ? (
                    <CardList cards={cardsToGive[rarity]} selected={yourCard} setSelected={setYourCard} truncateTo={cardsToReceive[rarity] ? 8 : 0} />
                  ) : (
                    <div className="text-neutral-500 ml-1">No cards to trade</div>
                  )}
                </div>
                <div className="w-full sm:w-1/2 p-1 border rounded-lg border-neutral-700 bg-neutral-800">
                  <h4 className="text-md font-medium mb-1 ml-1 text-neutral-400">{t('friendHas')}</h4>
                  {cardsToReceive[rarity] ? (
                    <CardList cards={cardsToReceive[rarity]} selected={friendCard} setSelected={setFriendCard} truncateTo={cardsToGive[rarity] ? 8 : 0} />
                  ) : (
                    <div className="text-neutral-500 ml-1">No cards to trade</div>
                  )}
                </div>
              </div>
            </div>
          ),
      )}
    </>
  )
}
