import type { Dispatch, FC, SetStateAction } from 'react'
import { Tooltip } from 'react-tooltip'
import { CardLine } from '@/components/CardLine'
import { usePendingTrades } from '@/services/trade/useTrade'
import type { Card } from '@/types'

interface Props {
  cards: Card[]
  selected: Card | null
  setSelected: Dispatch<SetStateAction<Card | null>>
}

export const CardList: FC<Props> = ({ cards, selected, setSelected }) => {
  const pendingTrades = usePendingTrades()

  // Sort cards by set name first, then by card number
  const sortedCards = [...cards].sort((a, b) => {
    const parseCardId = (cardId: string) => {
      const parts = cardId.split('-')
      const setName = parts[0] || ''
      const cardNumber = parts.length > 1 ? parseInt(parts[1], 10) : 0
      return { setName, cardNumber }
    }

    const aInfo = parseCardId(a.card_id)
    const bInfo = parseCardId(b.card_id)

    // First sort by set name
    if (aInfo.setName !== bInfo.setName) {
      return aInfo.setName.localeCompare(bInfo.setName)
    }

    // Then sort by card number
    return aInfo.cardNumber - bInfo.cardNumber
  })

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

  return <ul className="space-y-1">{sortedCards.map(item)}</ul>
}
