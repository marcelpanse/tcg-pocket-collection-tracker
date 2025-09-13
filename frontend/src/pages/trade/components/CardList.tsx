import type { Dispatch, FC, SetStateAction } from 'react'
import type { Card } from '@/types'
import { CardLine } from './CardLine'

interface Props {
  cards: Card[]
  selected: Card | null
  setSelected: Dispatch<SetStateAction<Card | null>>
}

export const CardList: FC<Props> = ({ cards, selected, setSelected }) => {
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
        <CardLine className={`w-full ${selected?.card_id === card.card_id && 'bg-green-900'} hover:bg-neutral-600`} card_id={card.card_id} rarity={false} />
      </li>
    )
  }

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 overflow-y-auto">
      <ul className="space-y-1">{cards.map(item)}</ul>
    </div>
  )
}
