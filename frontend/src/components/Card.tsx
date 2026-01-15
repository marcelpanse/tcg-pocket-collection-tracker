import i18n from 'i18next'
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { startTransition, useOptimistic } from 'react'
import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn, getCardNameByLang } from '@/lib/utils'
import { useDeleteCard, useSelectedCard, useUpdateCards } from '@/services/collection/useCollection'
import type { Card as CardType } from '@/types'
import { Spinner } from './Spinner'

interface CardProps {
  card: CardType
  className?: string
  editable?: boolean
  onImageClick?: () => void
}

export function Card({ card, onImageClick, className, editable = true }: CardProps) {
  const { setSelectedCardId } = useSelectedCard()
  const updateCardsMutation = useUpdateCards()
  const deleteCardMutation = useDeleteCard()
  const isPending = updateCardsMutation.isPending || deleteCardMutation.isPending
  const [amountOwned, setAmountOwned] = useOptimistic(card.amount_owned ?? 0, (_prev, curr: number) => curr)

  const updateCardCount = (x: number) => {
    startTransition(async () => {
      setAmountOwned(x)
      try {
        await updateCardsMutation.mutateAsync([{ card_id: card.card_id, internal_id: card.internal_id, amount_owned: x }])
      } catch (error) {
        console.log('Failed updating card count:', error)
      }
    })
  }

  const handleMinusButtonClick = () => {
    if (card.collected && amountOwned === 0) {
      startTransition(async () => {
        await deleteCardMutation.mutateAsync({ cardId: card.card_id })
      })
    } else {
      updateCardCount(amountOwned - 1)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      updateCardCount(value)
    }
  }

  return (
    <div className={cn('group flex flex-col items-center rounded-lg', className)}>
      <button
        type="button"
        className="relative cursor-pointer"
        onClick={() => {
          setSelectedCardId(card.internal_id)
          onImageClick?.()
        }}
      >
        <FancyCard card={card} selected={Boolean(card.collected) && !isPending} />
        {isPending && <Spinner size="md" overlay />}
      </button>
      <p
        className="w-full min-w-0 text-[12px] pt-2 text-center font-semibold leading-tight"
        title={card.updated_at ? `Last update ${card.updated_at.toLocaleString()}` : undefined}
      >
        <span className="block md:inline">{card.card_id}</span>
        <span className="hidden md:inline"> – </span>
        <span className="block md:inline truncate">{getCardNameByLang(card, i18n.language)}</span>
      </p>

      <div className="flex items-center gap-x-1">
        {editable ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMinusButtonClick}
              className="rounded-full"
              tabIndex={-1}
              disabled={!card.collected && amountOwned === 0}
              title={amountOwned === 0 ? 'Remove from card dex' : 'Decrease amount'}
            >
              {card.collected && amountOwned === 0 ? <Trash2Icon /> : <MinusIcon />}
            </Button>
            <input
              min="0"
              max="99"
              type="text"
              value={amountOwned}
              onChange={handleInputChange}
              className="w-7 text-center border-none rounded"
              onFocus={(event) => event.target.select()}
            />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => updateCardCount(amountOwned + 1)} tabIndex={-1} title="Increase amount">
              <PlusIcon />
            </Button>
          </>
        ) : (
          <span className="mt-1">{amountOwned}</span>
        )}
      </div>
    </div>
  )
}
