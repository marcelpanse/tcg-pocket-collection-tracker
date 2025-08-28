import type { Dispatch, FC, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { getCardNameByLang } from '@/lib/utils'
import type { Card, CollectionRow } from '@/types'

interface Props {
  cards: Card[]
  ownedCards: CollectionRow[]
  selected: Card | null
  setSelected: Dispatch<SetStateAction<Card | null>>
}

export const CardList: FC<Props> = ({ cards, ownedCards, selected, setSelected }) => {
  const { i18n } = useTranslation()
  function item(card: Card) {
    function onClick() {
      if (selected?.card_id === card.card_id) {
        setSelected(null)
      } else {
        setSelected(card)
      }
    }
    return (
      <li key={card.card_id} className={`flex rounded px-2 ${selected?.card_id === card.card_id && 'bg-green-900'} hover:bg-gray-500`} onClick={onClick}>
        <span className="min-w-14 me-4">{card.card_id} </span>
        <span>{getCardNameByLang(card, i18n.language)}</span>
        <span title="Amount you own" className="text-gray-400 ml-auto">
          <span style={{ userSelect: 'none' }}>×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
        </span>
      </li>
    )
  }

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 overflow-y-auto">
      <ul className="space-y-1">{cards.map(item)}</ul>
    </div>
  )
}
