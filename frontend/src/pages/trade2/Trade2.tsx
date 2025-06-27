import NumberFilter from '@/components/filters/NumberFilter.tsx'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/Auth.ts'
import { expansions, getCardById } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { fetchPublicAccount } from '@/lib/fetchAccount'
import { fetchCollection } from '@/lib/fetchCollection'
import type { AccountRow, Card, CollectionRow, Rarity } from '@/types'
import { CircleHelp } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Tooltip } from 'react-tooltip'
import CardList from './CardList'

const rarityOrder: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆']

interface TradeCard extends Card {
  amount_owned: number
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
  const [tradeProposition1, setTradeProposition1] = useState<string[]>([])
  const [tradeProposition2, setTradeProposition2] = useState<string[]>([])
  const propositionLength = tradeProposition1.length + tradeProposition2.length

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

  async function propose() {
    if (!account || !friendAccount) return
    const arr1 = tradeProposition1.map((card_id) => {
      return { from: account.friend_id, to: friendAccount.friend_id, card_id }
    })
    const arr2 = tradeProposition2.map((card_id) => {
      return { from: friendAccount.friend_id, to: account.friend_id, card_id }
    })
    const { error } = await supabase.from('trade_propositions').insert(arr1.concat(arr2))
    if (error) console.log('supa error:', error)
  }

  if (!friendAccount?.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  if (friendExtraCards === null || userExtraCards === null) return 'loading'

  return (
    <div className="flex flex-col gap-4">
      <p>{t('title')}</p>
      <p>{t('featureDescription')}</p>
      <p>{t('friendAccountDetails', { ...friendAccount })}</p>
      <div className="flex gap-4 justify-center">
        <div className="w-1/2">
          <div className="flex flex-row gap-4 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <NumberFilter numberFilter={userCardsMaxFilter} setNumberFilter={setUserCardsMaxFilter} options={[0, 1, 2, 3, 4, 5]} labelKey="maxNum" />
              <Tooltip id="minFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
              <CircleHelp className="h-4 w-4" data-tooltip-id="minFilter" data-tooltip-content={t('minFilterTooltip')} />
            </div>
            <Button type="button" onClick={propose} disabled={propositionLength === 0}>
              Propose trading {propositionLength} cards
            </Button>
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
                      <h4 className="text-md font-medium mb-2">{t('friendHas')}</h4>
                      <CardList
                        cards={friendExtraCards[rarity]}
                        ownedCards={ownedCards}
                        tradeProposition={tradeProposition1}
                        setTradeProposition={setTradeProposition1}
                        selectionColor="green"
                      />
                    </div>
                    <div>
                      <h4 className="text-md font-medium mb-2">{t('youHave')}</h4>
                      <CardList
                        cards={userExtraCards[rarity]}
                        ownedCards={ownedCards}
                        tradeProposition={tradeProposition2}
                        setTradeProposition={setTradeProposition2}
                        selectionColor="green"
                      />
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  )
}

export default Trade2
