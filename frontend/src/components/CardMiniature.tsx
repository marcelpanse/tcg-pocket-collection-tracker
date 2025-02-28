// src/components/CardMiniature.tsx
import FancyCard from '@/components/FancyCard'
import type { Card } from '@/types'

interface CardMiniatureProps {
  card: Card
  onSelect: (cardId: string, selected: boolean) => void
  selected: boolean // Use the selected prop directly
}

export function CardMiniature({ card, onSelect, selected }: CardMiniatureProps) {
  const handleClick = () => {
    onSelect(card.card_id, !selected) // Toggle selection state
  }

  return (
    <div className="flex flex-col items-center">
      <FancyCard
        card={card}
        selected={selected} // Pass the selected prop
        setIsSelected={handleClick} // Pass the click handler
        size="small"
      />
      <p className="text-xs text-center mt-1">{card.name}</p>
    </div>
  )
}
