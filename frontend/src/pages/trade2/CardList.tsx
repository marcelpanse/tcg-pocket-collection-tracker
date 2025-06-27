import type { Card, CollectionRow } from '@/types'

interface CardListProps {
  cards: Card[]
  ownedCards: CollectionRow[]
  tradeProposition: string[]
  setTradeProposition: any
  selectionColor: string
}

function CardList({ cards, ownedCards, tradeProposition, setTradeProposition, selectionColor }: CardListProps) {
  function item(card: Card) {
    const style = tradeProposition.includes(card.card_id) ? { color: selectionColor } : {}
    function onClick() {
      const i = tradeProposition.indexOf(card.card_id)
      if (i >= 0) {
        setTradeProposition((arr: string[]) => arr.filter((x) => x !== card.card_id))
      } else {
        setTradeProposition((arr: string[]) => [...arr, card.card_id])
      }
    }
    return (
      <li key={card.card_id} className="flex justify-between" onClick={onClick}>
        <span className="flex items-center" style={style}>
          <span className="min-w-14 me-4">{card.card_id} </span>
          <span>{card.name}</span>
        </span>
        <span title="Amount you own" className="text-gray-500">
          <span style={{ userSelect: 'none' }}>×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
        </span>
      </li>
    )
  }

  return (
    <div className="border rounded p-2 overflow-y-auto">
      <ul className="space-y-1">{cards.map(item)}</ul>
    </div>
  )
}

export default CardList
