import FancyCard from '@/components/FancyCard'
import { tradeableRaritiesDictionary } from '@/lib/CardsDB'
import type { Card } from '@/types'
import { Link } from 'react-router'

export function LookingForCard({ card }: { card: Card }) {
  return (
    <div className="group flex w-fit flex-col items-center rounded-lg">
      <Link viewTransition to={`/card/${card.card_id}`} state={{ card }}>
        <FancyCard card={card} selected={true} />
      </Link>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <div className="flex items-center gap-x-1">
        <span className="w-7 text-center border-none rounded">{tradeableRaritiesDictionary[card.rarity]}</span>
      </div>
    </div>
  )
}
