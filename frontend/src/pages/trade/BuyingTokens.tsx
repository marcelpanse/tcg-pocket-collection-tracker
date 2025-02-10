import { CardTable } from '@/components/ui/card-table'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { use, useMemo } from 'react'
import { BuyingTokensCard } from './components/BuyingTokensCard'
import { NoSellableCards } from './components/NoSellableCards'

export function BuyingTokens() {
  const { ownedCards } = use(CollectionContext)

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])
  const raritiesThatCanEarnTradeTokens = useMemo(() => Object.fromEntries(Object.entries(tradeableRaritiesDictionary).filter(([_, value]) => value > 0)), [])
  const forTradeCards = useMemo(() => ownedCards.filter((c) => c.amount_owned > 1), [ownedCards])
  const tradeableCards = useMemo(
    () =>
      allCards
        .filter((ac) => forTradeCards.findIndex((oc) => oc.card_id === ac.card_id) > -1)
        .map((ac) => ({
          ...ac,
          amount_owned: forTradeCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned,
        })),
    [forTradeCards],
  )
  const sellableCardsFilteredByGame = useMemo(
    () => tradeableCards.filter((c) => Object.keys(raritiesThatCanEarnTradeTokens).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [tradeableCards],
  )

  return sellableCardsFilteredByGame && sellableCardsFilteredByGame.length > 0 ? (
    <CardTable cards={sellableCardsFilteredByGame} cardElement={(card) => <BuyingTokensCard card={card} />} />
  ) : (
    <NoSellableCards />
  )
}
