import FancyCard from '@/components/FancyCard'
import type { Card } from '@/types'

interface CardMiniatureProps {
  card: Card
  onSelect: (cardId: string, selected: boolean) => void
  selected: boolean
}

export function CardMiniature({ card, onSelect, selected }: CardMiniatureProps) {
  const handleClick = () => {
    onSelect(card.card_id, !selected)
  }

  return (
    <div className="flex flex-col items-center justify-between">
      <FancyCard card={card} selected={selected} setIsSelected={handleClick} size="small" />
      <p className="text-xs text-center mt-1">{card.name}</p>
    </div>
  )
}
