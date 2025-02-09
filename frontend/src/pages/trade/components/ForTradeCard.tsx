import FancyCard from '@/components/FancyCard'
import type { Card } from '@/types'

export function ForTradeCard({ card }: { card: Card & { amount_owned?: number } }) {
  return (
    <div
      key={`div_${card.card_id}`}
      className="group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg"
    >
      <FancyCard key={`card_${card.card_id}`} card={card} selected={true} setIsSelected={() => {}} />
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]">
        {card.card_id} - {card.name}
      </p>
      <div className="rounded-xl bg-gray-600">
        <span className="m-3 font-semibold text-lg">{(card.amount_owned || 1) - 1}</span>
      </div>
    </div>
  )
}
