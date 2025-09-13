import { CircleHelp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Tooltip } from 'react-tooltip'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { getCardById, tradeableExpansions } from '@/lib/CardsDB.ts'
import { getExtraCards, getNeededCards } from '@/lib/utils'
import { CardList } from '@/pages/trade/components/CardList.tsx'
import { TradeOffer } from '@/pages/trade/components/TradeOffer.tsx'
import { useAccount, usePublicAccount } from '@/services/account/useAccount'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import { type Card, type Rarity, type TradableRarity, tradableRarities } from '@/types'

function getTradeCards(extraCards: string[], neededCards: string[]) {
  const neededCardsSet = new Set(neededCards)
  const common = extraCards
    .filter((card_id) => neededCardsSet.has(card_id))
    .map((card_id) => getCardById(card_id) as Card)
    .filter((card) => (tradableRarities as readonly Rarity[]).includes(card.rarity) && tradeableExpansions.includes(card.expansion))
  return Object.groupBy(common, (card) => card.rarity as TradableRarity)
}

function TradeWith() {
  const { t } = useTranslation('trade-matches')
  const { friendId } = useParams()

  const { data: friendAccount } = usePublicAccount(friendId)
  const { data: friendCards } = usePublicCollection(friendId)

  const { data: account } = useAccount()
  const { data: ownedCards = [] } = useCollection()

  const [userCardsMaxFilter, setUserCardsMaxFilter] = useState<number>((account?.max_number_of_cards_wanted || 1) - 1)
  const [friendCardsMinFilter, setFriendCardsMinFilter] = useState<number>((account?.min_number_of_cards_to_keep || 1) + 1)
  const [yourCard, setYourCard] = useState<Card | null>(null)
  const [friendCard, setFriendCard] = useState<Card | null>(null)

  if (!account) {
    return null
  }

  if (friendAccount === null) {
    return <p className="text-xl text-center py-8">{t('notFound')}</p>
  }

  if (friendAccount === undefined || friendCards === undefined) {
    return <p className="text-xl text-center py-8">Loading...</p>
  }

  if (!friendAccount.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  const userTrades = getTradeCards(getExtraCards(ownedCards, friendCardsMinFilter - 1), getNeededCards(friendCards, friendAccount.max_number_of_cards_wanted))
  const friendTrades = getTradeCards(getExtraCards(friendCards, friendAccount.min_number_of_cards_to_keep), getNeededCards(ownedCards, userCardsMaxFilter + 1))

  const hasPossibleTrades = tradableRarities.some((r) => (userTrades[r] ?? []).length > 0 && (friendTrades[r] ?? []).length > 0)

  return (
    <div className="kap-4 justify-center max-w-2xl m-auto px-2">
      <h1 className="mb-4">
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

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2 mt-2">
        <div className="flex items-center gap-2">
          <Tooltip id="maxFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
          <NumberFilter
            className="w-full sm:w-[260px]"
            numberFilter={friendCardsMinFilter}
            setNumberFilter={setFriendCardsMinFilter}
            options={[2, 3, 4, 5]}
            labelKey="minNum"
          />
          <CircleHelp className="h-4 w-4 mx-1" data-tooltip-id="maxFilter" data-tooltip-content={t('maxFilterTooltip')} />
        </div>
        <div className="flex sm:flex-row-reverse items-center gap-2">
          <Tooltip id="minFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
          <NumberFilter
            className="w-full sm:w-[260px]"
            numberFilter={userCardsMaxFilter}
            setNumberFilter={setUserCardsMaxFilter}
            options={[0, 1, 2, 3, 4, 5]}
            labelKey="maxNum"
          />
          <CircleHelp className="h-4 w-4 mx-1" data-tooltip-id="minFilter" data-tooltip-content={t('minFilterTooltip')} />
        </div>
      </div>

      {!hasPossibleTrades && (
        <div className="text-center py-8">
          <p className="text-xl ">{t('noPossibleTrades')}</p>
          <p className="text-sm text-gray-300 mt-2">{t('noPossibleTradesDescription')}</p>
        </div>
      )}

      {tradableRarities.map(
        (rarity) =>
          friendTrades[rarity] &&
          userTrades[rarity] && (
            <div key={rarity} className="mb-4">
              <h3 className="text-xl font-semibold mb-1 text-center">[ {rarity} ]</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="w-full sm:w-1/2">
                  <h4 className="text-md font-medium mb-1 ml-2">{t('youHave')}</h4>
                  <CardList cards={userTrades[rarity]} ownedCards={ownedCards} selected={yourCard} setSelected={setYourCard} />
                </div>
                <div className="w-full sm:w-1/2">
                  <h4 className="text-md font-medium mb-1 ml-2">{t('friendHas')}</h4>
                  <CardList cards={friendTrades[rarity]} ownedCards={ownedCards} selected={friendCard} setSelected={setFriendCard} />
                </div>
              </div>
            </div>
          ),
      )}
    </div>
  )
}

export default TradeWith
