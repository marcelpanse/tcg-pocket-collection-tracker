import { useContext, useState } from 'react'
import FancyCard from '@/components/FancyCard'
import { RankBadge } from '@/components/ui/rank-badge'
import { getCardById } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { Card } from '@/types'

export interface IDeck {
  name: string
  img_url: string
  deck_id: string
  cards: string[]
  rank: string
  main_card_id: string
  main_card_id2: string
  energy: string[]
}

export const DeckItem = ({ deck }: { deck: IDeck }) => {
  const { ownedCards } = useContext(CollectionContext)
  const [isOpen, setIsOpen] = useState(false)

  const missingCards: Card[] = deck.cards
    .map((cardId) => getCardById(cardId))
    .filter((cardObj, idx) => cardObj && !isSelected(deck.cards, cardObj, idx)) as Card[]

  function isSelected(deckCards: string[], cardObj: Card, idx: number): boolean {
    // Count how many times this card appears in the deck up to this index
    const countInDeckSoFar = deckCards.slice(0, idx + 1).filter((id) => id === cardObj.card_id).length

    // Find how many you own
    const cardIdOrAlternate: string[] = cardObj.alternate_versions.map((av) => av.card_id)
    const owned = ownedCards.find((c) => cardIdOrAlternate.some((id) => id === c.card_id.replace('_', '-')) && c.amount_owned > 0)
    const ownedAmount = owned ? owned.amount_owned : 0

    // Only select if you own enough copies for this instance
    return countInDeckSoFar <= ownedAmount
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: want to manage click on all div but can't use button for easthetic reasons
    <div role="button" tabIndex={0} key={deck.name} className="flex flex-col mt-5 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div
        className="
    border-b-2 border-slate-600 tracking-tight mb-5 pb-2
    flex flex-col gap-3
    lg:grid lg:grid-cols-[auto_minmax(0,35%)_auto] lg:items-center lg:gap-2 lg:justify-evenly
  "
      >
        <div className="flex justify-center items-center gap-2">
          <img src={deck.img_url} alt={deck.name} className="w-20 object-cover object-[0%_20%]" />
          <div className="flex flex-col gap-2">
            {deck.energy.map((energyType) => (
              <img key={energyType} src={`/images/energy/${energyType}.webp`} alt={energyType} className="h-4" />
            ))}
          </div>
          <div className="lg:hidden">
            <RankBadge rank={deck.rank} />
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <h2 className="text-center font-semibold text-md sm:text-lg md:text-2xl">{deck.name}</h2>
          {missingCards.length > 0 && `(${missingCards.length} missing)`}
          <div className="hidden lg:block">
            <RankBadge rank={deck.rank} />
          </div>
          <span className="flex justify-center items-center">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div>
          <div
            id="deck-cards"
            className="flex gap-x-2 gap-y-1 flex-1 flex-wrap items-start p-4 bg-neural-800 border-solid border-neutral-600 border-1 rounded-lg justify-center"
          >
            {deck.cards.map((cardId, idx) => {
              const cardObj = getCardById(cardId)
              const selected = cardObj ? isSelected(deck.cards, cardObj, idx) : false
              return (
                cardObj && (
                  <div
                    className={'group flex w-fit max-w-11 sm:max-w-20 md:max-w-29 flex-col items-center rounded-lg cursor-pointer'}
                    key={`${cardObj.name}-${idx}`}
                  >
                    <FancyCard card={cardObj} selected={selected} />

                    {selected ? (
                      ''
                    ) : (
                      <div className="relative w-full z-1">
                        <img src={`/images/sets/${cardObj.expansion}.webp`} alt={cardObj.expansion} className="h-4 sm:h-6 md:h-8 mr-2 absolute bottom-0" />
                      </div>
                    )}
                    <span className="font-semibold max-w-[130px] overflow-hidden pt-2 text-[12px] text-ellipsis">{cardObj.name}</span>
                    {selected ? '' : <span className="text-[12px]">({cardObj.pack.replace('pack', '')})</span>}
                  </div>
                )
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
