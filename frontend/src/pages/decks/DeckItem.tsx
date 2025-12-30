import i18n from 'i18next'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import FancyCard from '@/components/FancyCard'
import { Button } from '@/components/ui/button'
import { getCardById } from '@/lib/CardsDB'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import type { Card, Deck, Energy } from '@/types'

export interface IDeck {
  img_url: string
  rank: string
  name: string
  energy: Energy[]
  cards: string[]
}

const rankInfo: Record<string, string> = {
  S: 'The best decks are in the S tier, which are decks that have amazing consistency on top of being easy to build and function with minimal difficulty.',
  'A+': 'A+ Tier Decks are some of the most powerful metagame options. These can function at the highest level, but face competition against S tiers.',
  A: 'A Tier Decks are also powerful, and can also function at a high level, but may not be as easy to pilot as the S Tiers.',
  B: 'B Tier Decks are decent, but would require more skill to achieve success with.',
  C: "C Tier consists of the game's Rogue Decks. These are great for countering specific threats but require skilled pilots and specific circumstances to succeed with.",
  D: 'D Tier include decks that used to be stronger, and those kept to date with the latest sets, but lacks the consistency to keep up with the heavier hitters.',
}

const rankClassMap: Record<string, string> = {
  D: 'bg-gray-600',
  C: 'bg-yellow-600',
  B: 'bg-blue-600',
  A: 'bg-green-600',
  'A+': 'bg-orange-600',
  S: 'bg-red-600 font-bold',
}

export function DeckItemGame8({ deck }: { deck: IDeck }) {
  const { data: ownedCards } = useCollection()
  const { setSelectedCardId } = useSelectedCard()
  const [isOpen, setIsOpen] = useState(false)

  const info = rankInfo[deck.rank]

  const missingCards: Card[] = deck.cards
    .map((cardId) => getCardById(cardId))
    .filter((cardObj, idx) => cardObj && !isSelected(deck.cards, cardObj, idx)) as Card[]

  function isSelected(deckCards: string[], cardObj: Card, idx: number): boolean {
    if (!ownedCards) {
      return true
    }
    const countInDeckSoFar = deckCards.slice(0, idx + 1).filter((id) => id === cardObj.card_id).length
    const ownedAmount = cardObj.alternate_versions.reduce((acc, id) => acc + (ownedCards.get(id)?.amount_owned ?? 0), 0)
    return countInDeckSoFar <= ownedAmount
  }

  return (
    <div key={deck.name} className="flex flex-col rounded border-1 border-neutral-700 bg-neutral-800 p-1">
      <div className="flex flex-col sm:flex-row">
        <button
          className="flex flex-1 flex-col-reverse sm:flex-row gap-y-1 gap-x-4 cursor-pointer"
          type="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 min-w-0 sm:min-w-40">
            <span className={`mx-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-90'}`} aria-hidden="true">
              ▲
            </span>
            <img src={deck.img_url} alt={deck.name} className="w-20 object-cover object-[0%_20%]" />
            <span className={`${rankClassMap[deck.rank]} p-1 h-fit rounded w-7 text-center`} title={info}>
              {deck.rank}
            </span>
            <div className="flex flex-col gap-1 min-w-4">
              {deck.energy.map((energyType) => (
                <img key={energyType} src={`/images/energy/${energyType}.webp`} alt={energyType} className="h-4 w-4" />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline my-auto gap-x-2">
            <h2 className="text-nowrap font-semibold text-md sm:text-lg md:text-2xl">{deck.name}</h2>
            {missingCards.length > 0 && <span className="text-nowrap">{missingCards.length} missing</span>}
          </div>
        </button>
        <Link
          className="w-full sm:w-fit mt-2 sm:my-auto"
          to="/decks/edit"
          state={
            {
              is_public: false,
              name: deck.name,
              energy: deck.energy,
              cards: deck.cards
                .map((card_id) => getCardById(card_id))
                .filter((c) => !!c)
                .map((c) => c.internal_id),
            } satisfies Deck
          }
        >
          <Button className="w-full">
            Copy and edit
            <ChevronRight />
          </Button>
        </Link>
      </div>

      {/* Animated collapse/expand container */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isOpen}
      >
        <div className="flex gap-x-2 gap-y-2 flex-1 flex-wrap items-start justify-start pt-2 px-1">
          {deck.cards.map((cardId, idx) => {
            const cardObj = getCardById(cardId)
            const selected = cardObj ? isSelected(deck.cards, cardObj, idx) : false
            return (
              cardObj && (
                <div className={'group flex w-fit max-w-30 flex-col items-center rounded-lg cursor-pointer'} key={`${cardObj.name}-${idx}`}>
                  <button type="button" className="cursor-pointer" onClick={() => setSelectedCardId(cardObj.internal_id)}>
                    <FancyCard card={cardObj} selected={selected} />
                  </button>

                  <span className="font-semibold overflow-hidden pt-2 text-[12px] text-center">{getCardNameByLang(cardObj, i18n.language)}</span>
                </div>
              )
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function DeckItem({ deck }: { deck: Deck }) {
  return (
    <div key={deck.id} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-md p-2">
      <div className="flex flex-wrap gap-1 items-center justify-center w-10">
        {deck.energy.map((energy) => (
          <img key={energy} src={`/images/energy/${energy}.webp`} alt={energy} className="size-4" />
        ))}
      </div>
      <h2 className="font-semibold">{deck.name}</h2>
      <Link className="ml-auto" to={`/decks/edit/${deck.id}`}>
        <Button>
          Edit
          <ChevronRight />
        </Button>
      </Link>
    </div>
  )
}
