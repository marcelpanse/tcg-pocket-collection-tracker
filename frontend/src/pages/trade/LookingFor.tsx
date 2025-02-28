import { CardsTable } from '@/components/CardsTable.tsx'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { type FC, use, useMemo } from 'react'
import { NoCardsNeeded } from './components/NoCardsNeeded'

interface Props {
  rarityFilter: string[]
  minCards: number
}
export const LookingFor: FC<Props> = ({ rarityFilter, minCards }) => {
  const { ownedCards } = use(CollectionContext)

  const lookingForTradeCards = useMemo(
    () =>
      allCards.filter(
        (ac) =>
          ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1 ||
          ownedCards[ownedCards.findIndex((oc) => oc.card_id === ac.card_id)].amount_owned <= minCards,
      ),
    [ownedCards, minCards],
  )
  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])
  const cards = useMemo(
    () => lookingForTradeCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [lookingForTradeCards],
  )
  const filteredCards = useMemo(() => cards.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity)), [cards, rarityFilter])

  return cards && cards.length > 0 ? <CardsTable cards={filteredCards} /> : <NoCardsNeeded />
}
