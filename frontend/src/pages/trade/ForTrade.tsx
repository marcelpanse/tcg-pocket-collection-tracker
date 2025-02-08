import { CardTable } from '@/components/ui/card-table'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import type { CollectionRow } from '@/types'
import { ForTradeCard } from './components/ForTradeCard'

export function ForTrade({ ownedCards }: { ownedCards: CollectionRow[] }) {
  const tradeableExpansions = expansions.filter((e) => e.tradeable).map((e) => e.id)
  const forTradeCards = ownedCards.filter((c) => c.amount_owned > 1)
  const tradeableCards = allCards
    .filter((ac) => forTradeCards.findIndex((oc) => oc.card_id === ac.card_id) > -1)
    .map((ac) => {
      return {
        ...ac,
        amount_owned: forTradeCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned,
      }
    })

  return (
    <CardTable
      cards={tradeableCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion))}
      cardElement={(card) => {
        return <ForTradeCard card={card} />
      }}
    />
  )
}
