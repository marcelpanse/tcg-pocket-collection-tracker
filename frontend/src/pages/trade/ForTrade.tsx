import { CardTable } from '@/components/ui/card-table'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { use, useMemo } from 'react'
import { ForTradeCard } from './components/ForTradeCard'
import { GoTrackYourCards } from './components/GoTrackYourCards'
import { NoTradeableCards } from './components/NoTradeableCards'

export function ForTrade() {
  const { ownedCards } = use(CollectionContext)

  if (!ownedCards || ownedCards.every((c) => c.amount_owned < 2)) return <GoTrackYourCards />

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])
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
  const tradeableCardsFilteredByGame = useMemo(
    () => tradeableCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [tradeableCards],
  )

  return tradeableCardsFilteredByGame && tradeableCardsFilteredByGame.length > 0 ? (
    <CardTable
      cards={tradeableCardsFilteredByGame}
      cardElement={(card) => {
        return <ForTradeCard card={card} />
      }}
    />
  ) : (
    <NoTradeableCards />
  )
}
