import { CardTable } from '@/components/ui/card-table'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { use, useMemo } from 'react'
import { LookingForCard } from './components/LookingForCard'

export function LookingFor() {
  const { ownedCards } = use(CollectionContext)

  const lookingForTradeCards = useMemo(() => allCards.filter((ac) => ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1), [ownedCards])
  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])
  const cards = useMemo(
    () => lookingForTradeCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [lookingForTradeCards],
  )

  return (
    <CardTable
      cards={cards}
      cardElement={(card) => {
        return <LookingForCard card={card} />
      }}
    />
  )
}
