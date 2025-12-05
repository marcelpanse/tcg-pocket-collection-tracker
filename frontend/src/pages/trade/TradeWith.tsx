import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { getCardByInternalId, tradeableExpansions } from '@/lib/CardsDB.ts'
import { getExtraCards, getNeededCards } from '@/lib/utils'
import { CardList } from '@/pages/trade/components/CardList.tsx'
import { TradeOffer } from '@/pages/trade/components/TradeOffer.tsx'
import { useAccount, usePublicAccount } from '@/services/account/useAccount'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import { type Card, type CollectionRow, type Rarity, type TradableRarity, tradableRarities } from '@/types'

function getTradeCards(extraCards: number[], neededCards: number[]) {
  const neededCardsSet = new Set(neededCards)
  const common = extraCards
    .filter((internal_id) => neededCardsSet.has(internal_id))
    .map((internal_id) => getCardByInternalId(internal_id) as Card)
    .filter((card) => (tradableRarities as readonly Rarity[]).includes(card.rarity) && tradeableExpansions.includes(card.expansion))
  return Object.groupBy(common, (card) => card.rarity as TradableRarity)
}

function TradeWith() {
  const { t } = useTranslation(['trade-matches', 'common'])
  const { friendId } = useParams()

  const { data: friendAccount, isLoading: friendAccountLoading, isError: friendAccountError } = usePublicAccount(friendId)
  const { data: friendCards = new Map<number, CollectionRow>(), isLoading: friendCardsLoading, isError: friendCardsError } = usePublicCollection(friendId)

  const { data: account } = useAccount()
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()

  const [yourCard, setYourCard] = useState<Card | null>(null)
  const [friendCard, setFriendCard] = useState<Card | null>(null)

  if (!account) {
    return null
  }

  if (friendAccount === null) {
    return <p className="text-xl text-center py-8">{t('notFound')}</p>
  }

  if (friendAccountError || friendCardsError) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  if (friendAccountLoading || friendCardsLoading) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }

  if (!friendAccount?.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  const userTrades = getTradeCards(getExtraCards(ownedCards, account.trade_rarity_settings), getNeededCards(friendCards, friendAccount.trade_rarity_settings))
  const friendTrades = getTradeCards(getExtraCards(friendCards, friendAccount.trade_rarity_settings), getNeededCards(ownedCards, account.trade_rarity_settings))

  const hasPossibleTrades = tradableRarities.some((r) => (userTrades[r] ?? []).length > 0 && (friendTrades[r] ?? []).length > 0)

  return (
    <div className="kap-4 justify-center w-full m-auto px-1 sm:px-2">
      <title>{`Trade with ${friendAccount.username} – TCG Pocket Collection Tracker`}</title>
      <h1 className="mb-4 ms-1">
        <span className="text-2xl font-light">{t('tradingWith')}</span>
        <span className="text-2xl font-bold"> {friendAccount.username} </span>
        <span className="block sm:inline text-sm">
          <FriendIdDisplay friendId={friendAccount.friend_id} />
        </span>
      </h1>

      <TradeOffer
        yourId={account.friend_id}
        friendId={friendAccount.friend_id}
        yourCard={yourCard}
        friendCard={friendCard}
        setYourCard={setYourCard}
        setFriendCard={setFriendCard}
      />

      {!hasPossibleTrades && (
        <div className="text-center py-8">
          <p className="text-xl ">{t('noPossibleTrades')}</p>
          <p className="text-sm text-gray-300 mt-2">{t('noPossibleTradesDescription')}</p>
        </div>
      )}

      {tradableRarities.map((rarity) => (
        <div key={rarity} className="mt-4">
          <h3 className="text-xl font-semibold mb-2 text-center">[ {rarity} ]</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="w-full sm:w-1/2">
              <h4 className="text-md font-medium mb-1 ml-2">{t('youHave')}</h4>
              {userTrades[rarity] ? (
                <CardList cards={userTrades[rarity]} selected={yourCard} setSelected={setYourCard} />
              ) : (
                <div className="text-center text-neutral-500 rounded-lg border-1 border-neutral-700 border-solid p-2">No cards to trade</div>
              )}
            </div>
            <div className="w-full sm:w-1/2">
              <h4 className="text-md font-medium mb-1 ml-2">{t('friendHas')}</h4>
              {friendTrades[rarity] ? (
                <CardList cards={friendTrades[rarity]} selected={friendCard} setSelected={setFriendCard} />
              ) : (
                <div className="text-center text-neutral-500  rounded-lg border-1 border-neutral-700 border-solid p-2">No cards to trade</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TradeWith
