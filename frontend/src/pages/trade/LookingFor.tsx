import { CardTable } from '@/components/ui/card-table'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import type { CollectionRow } from '@/types'
import { LookingForCard } from './components/LookingForCard'

export function LookingFor({ ownedCards }: { ownedCards: CollectionRow[] }) {
  const lookingForTradeCards = allCards.filter((ac) => ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1)
  const tradeableExpansions = expansions.filter((e) => e.tradeable).map((e) => e.id)

  return (
    <CardTable
      cards={lookingForTradeCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion))}
      cardElement={(card) => {
        return <LookingForCard card={card} />
      }}
    />
  )
}
