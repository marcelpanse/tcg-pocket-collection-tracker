import { CardsTable } from '@/components/CardsTable.tsx'
import { allCards, sellableForTokensDictionary } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { type FC, use, useMemo } from 'react'
import { NoSellableCards } from './components/NoSellableCards'

interface Props {
  rarityFilter: string[]
  minCards: number
}

export const BuyingTokens: FC<Props> = ({ rarityFilter, minCards }) => {
  const { ownedCards } = use(CollectionContext)

  const sellableCards = useMemo(() => ownedCards.filter((c) => c.amount_owned >= minCards), [ownedCards, minCards])

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

  const sellableCardsFilteredByExpansion = useMemo(
    () => tradeableCards.filter((c) => Object.keys(sellableForTokensDictionary).includes(c.rarity)),
    [tradeableCards],
  )

  const filteredCards = useMemo(
    () => sellableCardsFilteredByExpansion.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity)),
    [sellableCardsFilteredByExpansion, rarityFilter],
  )

  return sellableCardsFilteredByExpansion && sellableCardsFilteredByExpansion.length > 0 ? <CardsTable cards={filteredCards} /> : <NoSellableCards />
}
