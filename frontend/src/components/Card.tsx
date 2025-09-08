import i18n from 'i18next'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn, getCardNameByLang } from '@/lib/utils'
import { useLoginDialog } from '@/services/auth/useAuth'
import { useSelectedCard, useUpdateCards } from '@/services/collection/useCollection'
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
  const [amountOwned, setAmountOwned] = useState(card.amount_owned || 0)
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

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
          updates: [{ card_id, amount_owned: newAmount }],
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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      await updateCardCount(value)
    }
  }

  if (card.linkedCardID) {
    return null
  }

  return (
    <div className={cn('group flex flex-col items-center rounded-lg', className)}>
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => {
          setSelectedCardId(card.card_id)
          onImageClick?.()
        }}
      >
        <FancyCard card={card} selected={amountOwned > 0} />
      </button>
      <p className="w-full min-w-0 text-[12px] pt-2 text-center font-semibold leading-tight">
        <span className="block md:inline">{card.card_id}</span>
        <span className="hidden md:inline"> – </span>
        <span className="block md:inline truncate">{getCardNameByLang(card, i18n.language)}</span>
      </p>

      <div className="flex items-center gap-x-1">
        {editable ? (
          <>
            <Button variant="ghost" size="icon" onClick={removeCard} className="rounded-full" tabIndex={-1}>
              <MinusIcon />
            </Button>
            <input
              min="0"
              max="99"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-7 text-center border-none rounded"
              onFocus={(event) => event.target.select()}
            />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={addCard} tabIndex={-1}>
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
