import FancyCard from '@/components/FancyCard'
import { sellableForTokensDictionary } from '@/lib/CardsDB'
import type { CollectedCard } from '@/types'
import { useMemo } from 'react'
import { Link } from 'react-router'

interface Props {
  card: CollectedCard
}

export function BuyingTokensCard({ card }: Props) {
  const amountOwned = useMemo(() => (card.amount_owned || 2) - 2, [card.amount_owned])
  const possibleCoinsToGet = useMemo(() => amountOwned * sellableForTokensDictionary[card.rarity], [amountOwned, card.rarity])

  return (
    <div className="group flex w-fit flex-col items-center rounded-lg">
      <Link viewTransition to={`/card/${card.card_id}`} state={{ card }}>
        <FancyCard card={card} selected={true} />
      </Link>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <div className="flex items-center gap-x-1">
        <span className="w-7 text-center border-none rounded">{amountOwned}</span>
        <span className="w-7 text-center border-none rounded">{possibleCoinsToGet}</span>
      </div>
    </div>
  )
}
