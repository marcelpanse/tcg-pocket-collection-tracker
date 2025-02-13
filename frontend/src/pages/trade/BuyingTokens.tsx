import { CardTable } from '@/components/ui/card-table'
import { allCards, sellableForTokensDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { use, useMemo } from 'react'
import { BuyingTokensCard } from './components/BuyingTokensCard'
import { NoSellableCards } from './components/NoSellableCards'

export function BuyingTokens() {
  const { ownedCards } = use(CollectionContext)

  const sellableCards = useMemo(() => ownedCards.filter((c) => c.amount_owned >= 3), [ownedCards])
  const tradeableCards = useMemo(
    () =>
      allCards
        .filter((ac) => sellableCards.findIndex((oc) => oc.card_id === ac.card_id) > -1)
        .map((ac) => ({
          ...ac,
          amount_owned: sellableCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned,
        })),
    [sellableCards],
  )
  const sellableCardsFilteredByGame = useMemo(() => tradeableCards.filter((c) => Object.keys(sellableForTokensDictionary).includes(c.rarity)), [tradeableCards])

  return sellableCardsFilteredByGame && sellableCardsFilteredByGame.length > 0 ? (
    <CardTable cards={sellableCardsFilteredByGame} cardElement={(card) => <BuyingTokensCard card={card} />} />
  ) : (
    <NoSellableCards />
  )
}
