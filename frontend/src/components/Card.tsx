import i18n from 'i18next'
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn, getCardNameByLang } from '@/lib/utils'
import { useLoginDialog } from '@/services/auth/useAuth'
import { useDeleteCard, useSelectedCard, useUpdateCards } from '@/services/collection/useCollection'
import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  className?: string
  editable?: boolean
  onImageClick?: () => void
}

// keep track of the debounce timeouts for each card
const _inputDebounce: Record<string, number | null> = {}

export function Card({ card, onImageClick, className, editable = true }: CardProps) {
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { setSelectedCardId } = useSelectedCard()
  const updateCardsMutation = useUpdateCards()
  const deleteCardMutation = useDeleteCard()
  const [amountOwned, setAmountOwned] = useState(card.amount_owned ?? 0)

  useEffect(() => {
    if (card.amount_owned !== undefined) {
      setAmountOwned(card.amount_owned)
    }
  }, [card.amount_owned])

  const updateCardCount = useCallback(
    async (newAmountIn: number) => {
      const card_id = card.card_id
      const newAmount = Math.max(0, newAmountIn)
      setAmountOwned(newAmount)

      if (_inputDebounce[card_id]) {
        window.clearTimeout(_inputDebounce[card_id])
      }
      _inputDebounce[card_id] = window.setTimeout(async () => {
        updateCardsMutation.mutate({
          updates: [{ card_id, internal_id: card.internal_id, amount_owned: newAmount }],
        })
      }, 1000)
    },
    [amountOwned, updateCardsMutation, card.card_id],
  )

  const addCard = useCallback(async () => {
    await updateCardCount(amountOwned + 1)
  }, [updateCardCount, setIsLoginDialogOpen])

  const removeCard = useCallback(async () => {
    await updateCardCount(amountOwned - 1)
  }, [updateCardCount, setIsLoginDialogOpen])

  const handleMinusButtonClick = useCallback(async () => {
    if (card.collected && amountOwned === 0) {
      deleteCardMutation.mutate({ cardId: card.card_id })
    } else {
      await removeCard()
    }
  }, [card.collected, card.card_id, amountOwned, deleteCardMutation, removeCard])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      await updateCardCount(value)
    }
  }

  return (
    <div className={cn('group flex flex-col items-center rounded-lg', className)}>
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => {
          setSelectedCardId(card.internal_id)
          onImageClick?.()
        }}
      >
        <FancyCard card={card} selected={Boolean(card.collected)} />
      </button>
      <p
        className="w-full min-w-0 text-[12px] pt-2 text-center font-semibold leading-tight"
        title={card.updated_at ? `Last update ${new Date(card.updated_at).toLocaleString()}` : undefined}
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={addCard} tabIndex={-1} title="Increase amount">
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
