import type { Dispatch, FC, SetStateAction } from 'react'
import { CardLine } from '@/components/CardLine'
import type { Card } from '@/types'

interface Props {
  cards: Card[]
  selected: Card | null
  setSelected: Dispatch<SetStateAction<Card | null>>
}

export const CardList: FC<Props> = ({ cards, selected, setSelected }) => {
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
    return (
      <li key={card.card_id} className="rounded cursor-pointer" onClick={onClick}>
        <CardLine className={`w-full ${selected?.card_id === card.card_id && 'bg-green-900'} hover:bg-neutral-600`} card_id={card.card_id} rarity="hidden" />
      </li>
    )
  }

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 overflow-y-auto">
      <ul className="space-y-1">{sortedCards.map(item)}</ul>
    </div>
  )
}
