import i18n from 'i18next'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import FancyCard from '@/components/FancyCard'
import { Button } from '@/components/ui/button'
import { getCardById } from '@/lib/CardsDB'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import type { Card, CollectionRow } from '@/types'
import { serializeDeckToUrl } from './utils'

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

export const DeckItem = ({ deck }: { deck: IDeck }) => {
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()
  const { setSelectedCardId } = useSelectedCard()
  const [isOpen, setIsOpen] = useState(false)

  const info = rankInfo[deck.rank]

  const missingCards: Card[] = deck.cards
    .map((cardId) => getCardById(cardId))
    .filter((cardObj, idx) => cardObj && !isSelected(deck.cards, cardObj, idx)) as Card[]

  function isSelected(deckCards: string[], cardObj: Card, idx: number): boolean {
    const countInDeckSoFar = deckCards.slice(0, idx + 1).filter((id) => id === cardObj.card_id).length
    const ownedAmount = cardObj.alternate_versions.reduce((acc, id) => acc + (ownedCards.get(id)?.amount_owned ?? 0), 0)
    return countInDeckSoFar <= ownedAmount
  }

  const editLink = useMemo(() => {
    const cards = deck.cards.map((card_id) => getCardById(card_id)?.internal_id).filter((id): id is number => Boolean(id))
    const map = new Map<number, number>()
    for (const id of cards) {
      map.set(id, (map.get(id) ?? 0) + 1)
    }
    const params = new URLSearchParams({
      deckName: deck.name,
      deckCards: serializeDeckToUrl(map),
    })
    return `/decks/edit?${params.toString()}`
  }, [deck.cards])

  return (
    <div key={deck.name} className="flex flex-col rounded border-1 border-neutral-700 bg-neutral-800 p-1">
      <button
        className="flex-wrap tracking-tight flex flex-col-reverse sm:flex-row gap-y-1 gap-x-4 cursor-pointer"
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
        <Link className="absolute right-2 sm:relative ml-auto my-auto" to={editLink}>
          <Button onClick={(e) => e.stopPropagation()}>Copy and edit</Button>
        </Link>
      </button>

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
