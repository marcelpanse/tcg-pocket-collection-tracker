import FancyCard from '@/components/FancyCard'
import type { Card } from '@/types'

export function ForTradeCard({ card }: { card: Card & { amount_owned?: number } }) {
  return (
    <div
      key={`div_${card.card_id}`}
      className="flex flex-col items-center gap-y-2 w-fit border border-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 group"
    >
      <FancyCard key={`card_${card.card_id}`} card={card} selected={true} setIsSelected={() => {}} />
      <p className="text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
        {card.card_id} - {card.name}
      </p>
      <div className="bg-gray-600 rounded-xl">
        <span className="text-lg font-semibold m-3">{(card.amount_owned || 1) - 1}</span>
      </div>
    </div>
  )
}
