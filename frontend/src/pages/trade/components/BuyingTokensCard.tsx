import FancyCard from '@/components/FancyCard'
import { tradeableRaritiesDictionary } from '@/lib/CardsDB'
import type { Card } from '@/types'

export function BuyingTokensCard({ card }: { card: Card & { amount_owned?: number } }) {
  const amountOwned = (card.amount_owned || 1) - 1
  const possibleCoinsToGet = amountOwned * tradeableRaritiesDictionary[card.rarity]
  return (
    <div
      key={`div_${card.card_id}`}
      className="group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg"
    >
      <FancyCard key={`card_${card.card_id}`} card={card} selected={true} setIsSelected={() => {}} />
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]">
        {card.card_id} - {card.name}
      </p>
      <div className="flex flex-row gap-x-2">
        <div className="rounded-xl bg-fuchsia-600">
          <span className="m-3 font-semibold text-lg">{amountOwned}</span>
        </div>
        <div className="rounded-xl bg-gray-600">
          <span className="m-3 font-semibold text-lg">{possibleCoinsToGet}</span>
        </div>
      </div>
    </div>
  )
}
