import { CardsTable } from '@/components/CardsTable.tsx'
import { allCards, expansions, tradeableRaritiesDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { type FC, use, useMemo } from 'react'
import { GoTrackYourCards } from './components/GoTrackYourCards'
import { NoTradeableCards } from './components/NoTradeableCards'

interface Props {
  rarityFilter: string[]
  minCards: number // Added minCards to props
}

export const ForTrade: FC<Props> = ({ rarityFilter, minCards }) => {
  const { ownedCards } = use(CollectionContext)

  if (!ownedCards || ownedCards.every((c) => c.amount_owned < minCards)) return <GoTrackYourCards />

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])
  const forTradeCards = useMemo(() => ownedCards.filter((c) => c.amount_owned >= minCards), [ownedCards, minCards])
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

  const tradeableCardsFilteredByExpansion = useMemo(
    () => tradeableCards.filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [tradeableCards],
  )

  const filteredCards = useMemo(
    () => tradeableCardsFilteredByExpansion.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity)),
    [tradeableCardsFilteredByExpansion, rarityFilter],
  )

  return tradeableCardsFilteredByExpansion && tradeableCardsFilteredByExpansion.length > 0 ? <CardsTable cards={filteredCards} /> : <NoTradeableCards />
}
