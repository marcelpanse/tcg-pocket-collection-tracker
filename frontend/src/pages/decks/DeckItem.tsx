import { useContext, useState } from 'react'
import FancyCard from '@/components/FancyCard'
import { RankBadge } from '@/components/ui/rank-badge'
import { getCardById } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { Card } from '@/types'
import CardDetail from '../collection/CardDetail'

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
  const { ownedCards, selectedCardId, setSelectedCardId } = useContext(CollectionContext)
  const [isOpen, setIsOpen] = useState(false)

  const missingCards: Card[] = deck.cards
    .map((cardId) => getCardById(cardId))
    .filter((cardObj, idx) => cardObj && !isSelected(deck.cards, cardObj, idx)) as Card[]

  function isSelected(deckCards: string[], cardObj: Card, idx: number): boolean {
    const countInDeckSoFar = deckCards.slice(0, idx + 1).filter((id) => id === cardObj.card_id).length
    const cardIdOrAlternate: string[] = cardObj.alternate_versions.map((av) => av.card_id)
    const owned = ownedCards.find((c) => cardIdOrAlternate.some((id) => id === c.card_id.replace('_', '-')) && c.amount_owned > 0)
    const ownedAmount = owned ? owned.amount_owned : 0
    return countInDeckSoFar <= ownedAmount
  }

  return (
    <div key={deck.name} className="flex flex-col mt-5 cursor-pointer">
      {/* biome-ignore lint/a11y/useSemanticElements: want to manage click on all div but can't use button for easthetic reasons */}
      <div
        className="border-b-1 border-slate-600 tracking-tight pb-5 flex flex-row gap-x-2"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-center items-center gap-2 min-w-0 sm:min-w-40">
          <img src={deck.img_url} alt={deck.name} className="w-20 object-cover object-[0%_20%]" />
          <RankBadge rank={deck.rank} />
          <div className="flex flex-col gap-2 min-w-4">
            {deck.energy.map((energyType) => (
              <img key={energyType} src={`/images/energy/${energyType}.webp`} alt={energyType} className="h-4 w-4" />
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <h2 className="text-center font-semibold text-md sm:text-lg md:text-2xl">{deck.name}</h2>
          {missingCards.length > 0 && `(${missingCards.length} missing)`}
          <span className={`flex justify-center items-center transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true">
            ▲
          </span>
        </div>
      </div>

      {/* Animated collapse/expand container */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div id="deck-cards" className="flex gap-x-2 gap-y-2 flex-1 flex-wrap items-start justify-start mb-5">
          {deck.cards.map((cardId, idx) => {
            const cardObj = getCardById(cardId)
            const selected = cardObj ? isSelected(deck.cards, cardObj, idx) : false
            return (
              cardObj && (
                <div
                  className={'group flex w-fit max-w-11 sm:max-w-20 md:max-w-30 flex-col items-center rounded-lg cursor-pointer'}
                  key={`${cardObj.name}-${idx}`}
                >
                  <button type="button" className="cursor-pointer" onClick={() => setSelectedCardId(`${cardObj.card_id}`)}>
                    <FancyCard card={cardObj} selected={selected} clickable={true} />
                  </button>

                  <span className="font-semibold max-w-[130px] overflow-hidden pt-2 text-[12px] text-ellipsis">{cardObj.name}</span>
                </div>
              )
            )
          })}
        </div>
        <div>{selectedCardId && <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />}</div>
      </div>
    </div>
  )
}
