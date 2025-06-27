import NumberFilter from '@/components/filters/NumberFilter.tsx'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/Auth'
import { expansions, getCardById } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { fetchPublicAccount } from '@/lib/fetchAccount'
import { fetchCollection } from '@/lib/fetchCollection'
import type { AccountRow, Card, CollectionRow, Rarity, TradeRow } from '@/types'
import { CircleHelp } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Tooltip } from 'react-tooltip'

const rarityOrder: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆']

interface TradeCard extends Card {
  amount_owned: number
}

interface TradeOfferProps {
  yourCards: Card[]
  friendCards: Card[]
  yourId: string
  friendId: string
}

function groupByRarity(cards: Card[]): Record<Rarity, Card[]> {
  const res: Record<Rarity, Card[]> = {
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

  for (const c of cards) {
    res[c.rarity].push(c)
  }

  return res
}

interface CardListProps {
  cards: Card[]
  ownedCards: CollectionRow[]
  tradeOffer: Card[]
  setTradeOffer: Dispatch<SetStateAction<Card[]>>
}

function CardList({ cards, ownedCards, tradeOffer: tradeProposition, setTradeOffer: setTradeProposition }: CardListProps) {
  function item(card: Card) {
    const selected = tradeProposition.some((c) => c.card_id === card.card_id)
    function onClick() {
      const i = tradeProposition.findIndex((c) => c.card_id === card.card_id)
      if (i >= 0) {
        setTradeProposition((arr: Card[]) => arr.filter((c) => c.card_id !== card.card_id))
      } else {
        setTradeProposition((arr: Card[]) => [...arr, card])
      }
    }
    return (
      <li key={card.card_id} className={`flex rounded px-2 ${selected && 'bg-green-900'} hover:bg-gray-500`} onClick={onClick}>
        <span className="min-w-14 me-4">{card.card_id} </span>
        <span>{card.name}</span>
        <span title="Amount you own" className="text-gray-400 ml-auto">
          <span style={{ userSelect: 'none' }}>×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
        </span>
      </li>
    )
  }

  return (
    <div className="border rounded p-2 overflow-y-auto">
      <ul className="space-y-1">{cards.map(item)}</ul>
    </div>
  )
}

function Trade2() {
  const { t } = useTranslation('trade-matches')

  const { friendId } = useParams()
  if (!friendId) return 'Wrong friend id'

  const { account } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)
  const [friendAccount, setFriendAccount] = useState<AccountRow | null>(null)
  const [friendCards, setFriendCards] = useState<CollectionRow[] | null>(null)

  const [userCardsMaxFilter, setUserCardsMaxFilter] = useState<number>((account?.max_number_of_cards_wanted || 1) - 1)
  const [friendCardsMinFilter, setFriendCardsMinFilter] = useState<number>((account?.min_number_of_cards_to_keep || 1) + 1)
  const [tradeProposition1, setTradeProposition1] = useState<Card[]>([])
  const [tradeProposition2, setTradeProposition2] = useState<Card[]>([])

  useEffect(() => {
    if (!friendAccount) fetchPublicAccount(friendId).then(setFriendAccount)
    if (!friendCards) fetchCollection(undefined, friendId).then(setFriendCards)
  })

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  const friendExtraCards = useMemo(() => {
    if (!friendCards) return null
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
    if (!friendCards) return null
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

  function TradeOffer({ yourCards, friendCards, yourId, friendId }: TradeOfferProps) {
    const cards1 = groupByRarity(yourCards)
    const cards2 = groupByRarity(friendCards)
    const offers: { yourCard: Card | undefined; friendCard: Card | undefined }[] = []

    for (const r of rarityOrder) {
      for (let i = 0; i < Math.max(cards1[r].length, cards2[r].length); i++) {
        offers.push({ yourCard: cards1[r][i], friendCard: cards2[r][i] })
      }
    }

    function card(c: Card | undefined) {
      if (!c) {
        return <span className="w-1/2 text-center">–</span>
      }
      return (
        <span className="flex w-1/2">
          <span className="min-w-10">{c.rarity} </span>
          <span className="min-w-14 me-4">{c.card_id} </span>
          <span>{c.name}</span>
        </span>
      )
    }

    async function submit() {
      const trades = offers
        .map(
          ({ yourCard, friendCard }) =>
            ({
              offering_friend_id: yourId,
              receiving_friend_id: friendId,
              offer_card_id: yourCard?.card_id,
              receiver_card_id: friendCard?.card_id,
              status: 'offered',
            }) as TradeRow,
        )
        .filter((row) => row.offer_card_id && row.receiver_card_id)
      const { error } = await supabase.from('trades').insert(trades)
      if (error) {
        console.log(error)
      } else {
        setTradeProposition1([])
        setTradeProposition2([])
      }
    }

    return (
      <div>
        <h2 className="text-center mt-4 text-2xl mb-2">Trade offer</h2>
        <div className="border rounded p-2">
          <div className="flex justify-between mx-2 mb-2">
            <h4 className="text-lg font-medium">{t('youGive')}</h4>
            <h4 className="text-lg font-medium">{t('youReceive')}</h4>
          </div>
          <ul className="min-h-22">
            {offers.map(({ yourCard, friendCard }, i) => (
              <li key={i} className="flex justify-between rounded bg-zinc-800 px-1 mt-2">
                {card(yourCard)}
                {card(friendCard)}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center mt-2">
          <Button type="button" onClick={submit} disabled={offers.length === 0 || rarityOrder.some((r) => cards1[r].length !== cards2[r].length)}>
            {t('offerTrades', { n: offers.length })}
          </Button>
        </div>
      </div>
    )
  }

  if (!account || !friendAccount || friendExtraCards === null || userExtraCards === null) return 'loading'

  if (!friendAccount.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  return (
    <div className="gap-4 justify-center max-w-2xl m-auto">
      <h1 className="mb-4">
        <p className="text-2xl font-light">{t('tradingWith')}</p>
        <p className="text-4xl font-bold">{friendAccount.username}</p>
        <p>
          <span className="text-sm">Friend ID </span>
          <span className="text-md">{friendAccount.friend_id}</span>
        </p>
      </h1>
      <TradeOffer yourCards={tradeProposition2} friendCards={tradeProposition1} yourId={account.friend_id} friendId={friendAccount.friend_id} />
      <h2 className="text-center mt-8 text-2xl mb-2">Choose cards</h2>
      <div className="flex gap-4 mb-2 justify-between">
        <div className="flex items-center gap-2">
          <NumberFilter numberFilter={userCardsMaxFilter} setNumberFilter={setUserCardsMaxFilter} options={[0, 1, 2, 3, 4, 5]} labelKey="maxNum" />
          <Tooltip id="minFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
          <CircleHelp className="h-4 w-4" data-tooltip-id="minFilter" data-tooltip-content={t('minFilterTooltip')} />
        </div>
        <div className="flex items-center gap-2">
          <Tooltip id="maxFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
          <CircleHelp className="h-4 w-4" data-tooltip-id="maxFilter" data-tooltip-content={t('maxFilterTooltip')} />
          <NumberFilter numberFilter={friendCardsMinFilter} setNumberFilter={setFriendCardsMinFilter} options={[2, 3, 4, 5]} labelKey="minNum" />
        </div>
      </div>
      {rarityOrder.map(
        (rarity) =>
          friendExtraCards[rarity].length > 0 &&
          userExtraCards[rarity].length > 0 && (
            <div key={rarity} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{rarity}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-medium mb-2">{t('youHave')}</h4>
                  <CardList cards={userExtraCards[rarity]} ownedCards={ownedCards} tradeOffer={tradeProposition2} setTradeOffer={setTradeProposition2} />
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">{t('friendHas')}</h4>
                  <CardList cards={friendExtraCards[rarity]} ownedCards={ownedCards} tradeOffer={tradeProposition1} setTradeOffer={setTradeProposition1} />
                </div>
              </div>
            </div>
          ),
      )}
    </div>
  )
}

export default Trade2
