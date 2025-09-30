import type { ClassValue } from 'clsx'
import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getCardById } from '@/lib/CardsDB'
import { cn, getCardNameByLang } from '@/lib/utils'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'

interface Props {
  card_id: string
  className?: string
  increment?: number

  rarity?: ClassValue
  id?: ClassValue
  name?: ClassValue
  amount?: ClassValue
  details?: ClassValue
}

export const CardLine: FC<Props> = ({ card_id, className, increment, rarity, id, name, amount, details }) => {
  const { i18n } = useTranslation('trade-matches')

  const { data: ownedCards = [] } = useCollection()
  const { setSelectedCardId } = useSelectedCard()

  const card = useMemo(() => getCardById(card_id), [card_id])
  const ownedAmount = useMemo(() => ownedCards.find((c) => c.card_id === card?.card_id)?.amount_owned ?? 0, [card])

  if (!card) {
    throw new Error(`Unrecognized card_id: ${card_id}`)
  }

  return (
    <span className={cn('flex rounded pl-1 bg-zinc-800', className)}>
      <span className={cn('mr-2 sm:min-w-10', rarity)}>{card.rarity === 'Crown Rare' ? '♛' : card.rarity} </span>
      <span className={cn('mr-2 sm:min-w-14 me-4', id)}>{card.card_id} </span>
      <span className={cn('mr-1', name)}>{getCardNameByLang(card, i18n.language)}</span>
      <span className={cn('text-neutral-400 ml-auto mr-2', amount)}>
        ×{ownedAmount}
        {increment && (
          <>
            <span className="mx-1">→</span>×{ownedAmount + increment}
          </>
        )}
      </span>
      <button
        type="button"
        className={cn('rounded bg-zinc-600 px-1 cursor-pointer', details)}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedCardId(card_id)
        }}
      >
        <svg className="fill-neutral-100 w-4 h-4 my-auto" viewBox="0 0 122.88 112.5">
          <title>Card details</title>
          <g>
            <path d="M12.56,87.39c6.93,0,12.56,5.62,12.56,12.56c0,6.93-5.62,12.56-12.56,12.56C5.62,112.5,0,106.88,0,99.95 C0,93.01,5.62,87.39,12.56,87.39L12.56,87.39z M35.07,88.24h86.38c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43 H35.07c-0.79,0-1.43-0.64-1.43-1.43V89.67C33.64,88.88,34.29,88.24,35.07,88.24L35.07,88.24z M35.07,44.7h86.38 c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43H35.07c-0.79,0-1.43-0.64-1.43-1.43V46.13 C33.64,45.34,34.29,44.7,35.07,44.7L35.07,44.7z M35.07,1.16h86.38c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43 H35.07c-0.79,0-1.43-0.64-1.43-1.43V2.59C33.64,1.8,34.29,1.16,35.07,1.16L35.07,1.16z M12.56,43.69c6.93,0,12.56,5.62,12.56,12.56 c0,6.93-5.62,12.56-12.56,12.56C5.62,68.81,0,63.19,0,56.25C0,49.32,5.62,43.69,12.56,43.69L12.56,43.69z M12.56,0 c6.93,0,12.56,5.62,12.56,12.56c0,6.93-5.62,12.56-12.56,12.56C5.62,25.11,0,19.49,0,12.56C0,5.62,5.62,0,12.56,0L12.56,0z" />
          </g>
        </svg>
      </button>
    </span>
  )
}
