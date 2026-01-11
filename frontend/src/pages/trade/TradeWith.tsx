import { ChevronFirst, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { Switch } from '@/components/ui/switch'
import { getCardByInternalId, tradeableExpansions } from '@/lib/CardsDB.ts'
import { getExtraCards, getNeededCards } from '@/lib/utils'
import { CardList } from '@/pages/trade/components/CardList.tsx'
import { TradeOffer } from '@/pages/trade/components/TradeOffer.tsx'
import { useAccount, usePublicAccount } from '@/services/account/useAccount'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import { useAllTrades } from '@/services/trade/useTrade'
import { type Card, type CollectionRow, type Rarity, type TradableRarity, tradableRarities } from '@/types'
import TradeList from './components/TradeList'

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
  const [searchParams] = useSearchParams()

  const { data: friendAccount, isLoading: friendAccountLoading, isError: friendAccountError } = usePublicAccount(friendId)
  const { data: friendCards = new Map<number, CollectionRow>(), isLoading: friendCardsLoading, isError: friendCardsError } = usePublicCollection(friendId)

  const { data: account } = useAccount()
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()

  const [viewHistory, setViewHistory] = useState(false)
  const [pageHistory, setPageHistory] = useState(0)
  const allTrades = useAllTrades(friendAccount?.friend_id, pageHistory, viewHistory)

  const [yourCard, setYourCard] = useState<Card | null>(null)
  const [friendCard, setFriendCard] = useState<Card | null>(() => {
    const id = searchParams.get('friend_card')
    return id ? (getCardByInternalId(Number(id)) ?? null) : null
  })

  useEffect(() => {
    const id = searchParams.get('friend_card')
    if (!id || !friendCards || !ownedCards) {
      return
    }
    const card = getCardByInternalId(Number(id))
    if (!card) {
      return
    }
    const el = document.getElementById(card.rarity)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [searchParams, friendCards, ownedCards])

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
    return <Spinner size="lg" overlay />
  }

  if (!friendAccount?.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  const userTrades = getTradeCards(
    getExtraCards(ownedCards, account.trade_rarity_settings || []),
    getNeededCards(friendCards, friendAccount.trade_rarity_settings || []),
  )
  const friendTrades = getTradeCards(
    getExtraCards(friendCards, friendAccount.trade_rarity_settings || []),
    getNeededCards(ownedCards, account.trade_rarity_settings || []),
  )

  const hasPossibleTrades = tradableRarities.some((r) => (userTrades[r] ?? []).length > 0 && (friendTrades[r] ?? []).length > 0)

  return (
    <div className="flex flex-col gap-4 w-full px-1 sm:px-2">
      <title>{`Trade with ${friendAccount.username} – TCG Pocket Collection Tracker`}</title>
      <div className="mx-1 flex justify-between">
        <h1>
          <span className="text-2xl font-light">{t('tradingWith')}</span>
          <span className="text-2xl font-bold"> {friendAccount.username} </span>
          <span className="block sm:inline text-sm">
            <FriendIdDisplay friendId={friendAccount.friend_id} />
          </span>
        </h1>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <label htmlFor={`history-${friendId}`} className="my-auto flex items-center">
            {t('viewHistory')}
            <Switch id={`history-${friendId}`} className="ml-2 my-auto" checked={viewHistory} onCheckedChange={setViewHistory} />
          </label>
          <Link to={`/collection/${friendId}`}>
            <Button>
              Collection
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </div>
      {viewHistory &&
        (allTrades.isLoading ? (
          <Spinner size="md" />
        ) : (
          allTrades.data && (
            <TradeList trades={allTrades.data.trades}>
              <p className="flex justify-between mt-2">
                <span className="text-neutral-400">{allTrades.data.count} total offers</span>
                <div className="flex items-center gap-2">
                  <span>Page {pageHistory + 1}</span>
                  <Button variant="outline" onClick={() => setPageHistory(() => 0)} disabled={pageHistory <= 0}>
                    <ChevronFirst />
                  </Button>
                  <Button variant="outline" onClick={() => setPageHistory((prev) => prev - 1)} disabled={pageHistory <= 0}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" onClick={() => setPageHistory((prev) => prev + 1)} disabled={!allTrades.data.hasNext}>
                    <ChevronRight />
                  </Button>
                </div>
              </p>
            </TradeList>
          )
        ))}

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
        <div key={rarity}>
          <h3 id={rarity} className="text-xl font-semibold mb-2 text-center">
            [ {rarity} ]
          </h3>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
            <div className="w-full sm:w-1/2">
              <h4 className="text-md font-medium mb-1 ml-2 text-neutral-400">{t('youHave')}</h4>
              {userTrades[rarity] ? (
                <CardList cards={userTrades[rarity]} selected={yourCard} setSelected={setYourCard} />
              ) : (
                <div className="text-center text-neutral-500 rounded-lg border-1 border-neutral-700 border-solid p-2">No cards to trade</div>
              )}
            </div>
            <div className="w-full sm:w-1/2">
              <h4 className="text-md font-medium mb-1 ml-2 text-neutral-400">{t('friendHas')}</h4>
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
