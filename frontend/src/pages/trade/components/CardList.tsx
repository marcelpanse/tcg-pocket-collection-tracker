import { type Dispatch, type SetStateAction, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { CardLine } from '@/components/CardLine'
import { usePendingTrades } from '@/services/trade/useTrade'
import type { Card } from '@/types'

interface Props {
  cards: Card[]
  selected: Card | null
  setSelected: Dispatch<SetStateAction<Card | null>>
  truncateTo: number
}

export function CardList({ cards, selected, setSelected, truncateTo }: Props) {
  const pendingTrades = usePendingTrades()
  const shouldTruncate = cards.length > truncateTo
  const [showAll, setShowAll] = useState(!shouldTruncate)

  // Sort cards by set name first, then by card number
  const sortedCards = cards.toSorted((a, b) => a.internal_id - b.internal_id)

  function item(card: Card) {
    function onClick() {
      if (selected?.card_id === card.card_id) {
        setSelected(null)
      } else {
        setSelected(card)
      }
    }
    const pending = pendingTrades?.get(card.card_id)
    return (
      <li key={card.card_id} className="rounded flex">
        <CardLine
          className={`w-full cursor-pointer bg-neutral-900 hover:bg-neutral-700 ${selected?.card_id === card.card_id && 'bg-green-800/50'}`}
          card_id={card.card_id}
          rarity="hidden"
          onClick={onClick}
        >
          {pending && (
            <>
              <Tooltip id={`trading-${card.card_id}`} clickable={true} style={{ maxWidth: '300px', whiteSpace: 'normal' }} />
              <span
                className="text-xs mr-1 my-1 px-1 rounded border border-yellow-700/50 bg-yellow-800/40"
                data-tooltip-id={`trading-${card.card_id}`}
                data-tooltip-content={`You have ${pending} pending trade with this card.`}
              >
                {pending}
              </span>
            </>
          )}
        </CardLine>
      </li>
    )
  }

  return (
    <ul className="space-y-1">
      {(showAll ? sortedCards : sortedCards.slice(0, truncateTo)).map(item)}
      {shouldTruncate && (
        <button type="button" className="ml-1 hover:underline cursor-pointer" onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Show less' : truncateTo > 0 ? `Show ${sortedCards.length - truncateTo} more cards` : `Show ${sortedCards.length} cards`}
        </button>
      )}
    </ul>
  )
}
