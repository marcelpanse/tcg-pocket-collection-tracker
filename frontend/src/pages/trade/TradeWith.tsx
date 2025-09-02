import { CircleHelp } from 'lucide-react'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { Tooltip } from 'react-tooltip'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { expansions, getCardById } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { FriendCollectionLoaderReturn } from '@/lib/friendCollectionLoader.ts'
import { CardList } from '@/pages/trade/components/CardList.tsx'
import { TradeOffer } from '@/pages/trade/components/TradeOffer.tsx'
import type { Card, Rarity } from '@/types'

const rarityOrder: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆']

interface TradeCard extends Card {
  amount_owned: number
}

function TradeWith() {
  const { t } = useTranslation('trade-matches')

  const { friendAccount, friendCollection: friendCards } = useLoaderData() as FriendCollectionLoaderReturn

  const { account } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)

  const [userCardsMaxFilter, setUserCardsMaxFilter] = useState<number>((account?.max_number_of_cards_wanted || 1) - 1)
  const [friendCardsMinFilter, setFriendCardsMinFilter] = useState<number>((account?.min_number_of_cards_to_keep || 1) + 1)
  const [yourCard, setYourCard] = useState<Card | null>(null)
  const [friendCard, setFriendCard] = useState<Card | null>(null)

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  const friendExtraCards = useMemo(() => {
    if (!friendCards) {
      return null
    }
    const result: Record<Rarity, TradeCard[]> = {
      '◊': [],
      '◊◊': [],
      '◊◊◊': [],
      '◊◊◊◊': [],
      '☆': [],
      '☆☆': [],
      '☆☆☆': [],
      '✵': [],
      '✵✵': [],
      'Crown Rare': [],
      P: [],
      '': [],
    }

    const friendExtraCards = friendCards.filter((card) => card.amount_owned > (friendAccount?.min_number_of_cards_to_keep || 1))
    const userCardIds = new Set(ownedCards.filter((card) => card.amount_owned > userCardsMaxFilter).map((card) => card.card_id))
    const cardsUserNeeds = friendExtraCards.filter((card) => !userCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsUserNeeds) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards, userCardsMaxFilter, friendCardsMinFilter])

  const userExtraCards = useMemo(() => {
    if (!friendCards) {
      return null
    }
    const result: Record<Rarity, TradeCard[]> = {
      '◊': [],
      '◊◊': [],
      '◊◊◊': [],
      '◊◊◊◊': [],
      '☆': [],
      '☆☆': [],
      '☆☆☆': [],
      '✵': [],
      '✵✵': [],
      'Crown Rare': [],
      P: [],
      '': [],
    }

    const userExtraCards = ownedCards.filter((card) => card.amount_owned >= friendCardsMinFilter)
    const friendCardIds = new Set(
      friendCards.filter((card) => card.amount_owned >= (friendAccount?.max_number_of_cards_wanted || 1)).map((card) => card.card_id),
    )
    const cardsFriendNeeds = userExtraCards.filter((card) => !friendCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsFriendNeeds) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards, userCardsMaxFilter, friendCardsMinFilter])

  // Check if there are any possible trades across all rarities
  const hasPossibleTrades = useMemo(() => {
    return rarityOrder.some((rarity) => friendExtraCards && friendExtraCards[rarity].length > 0 && userExtraCards && userExtraCards[rarity].length > 0)
  }, [friendExtraCards, userExtraCards])

  if (!account || !friendAccount || friendExtraCards === null || userExtraCards === null) {
    return null
  }

  if (!friendAccount.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

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

      {rarityOrder.map(
        (rarity) =>
          friendExtraCards[rarity].length > 0 &&
          userExtraCards[rarity].length > 0 && (
            <div key={rarity} className="mb-4">
              <h3 className="text-xl font-semibold mb-1 text-center">[ {rarity} ]</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="w-full sm:w-1/2">
                  <h4 className="text-md font-medium mb-1 ml-2">{t('youHave')}</h4>
                  <CardList cards={userExtraCards[rarity]} ownedCards={ownedCards} selected={yourCard} setSelected={setYourCard} />
                </div>
                <div className="w-full sm:w-1/2">
                  <h4 className="text-md font-medium mb-1 ml-2">{t('friendHas')}</h4>
                  <CardList cards={friendExtraCards[rarity]} ownedCards={ownedCards} selected={friendCard} setSelected={setFriendCard} />
                </div>
              </div>
            </div>
          ),
      )}
    </div>
  )
}

export default TradeWith
