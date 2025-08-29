import i18n from 'i18next'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { use, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { getCardNameByLang } from '@/lib/utils'
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
  const params = useParams()

  const { user, setIsLoginDialogOpen } = use(UserContext)
  const { setSelectedCardId, updateCards } = use(CollectionContext)
  const [amountOwned, setAmountOwned] = useState(card.amount_owned || 0)
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

  const updateCardCount = useCallback(
    async (newAmountIn: number) => {
      if (!user?.user.email) {
        return
      }
      const card_id = card.card_id
      const newAmount = Math.max(0, newAmountIn)
      setAmountOwned(newAmount)

      if (_inputDebounce[card_id]) {
        window.clearTimeout(_inputDebounce[card_id])
      }
      _inputDebounce[card_id] = window.setTimeout(async () => {
        if (!user || !user.user.email) {
          throw new Error('User not logged in')
        }
        await updateCards([{ card_id, amount_owned: newAmount }])
      }, 1000)
    },
    [user, amountOwned],
  )

  const addCard = useCallback(async () => {
    if (!user) {
      setIsLoginDialogOpen(true)
      return
    }
    await updateCardCount(amountOwned + 1)
  }, [updateCardCount])

  const removeCard = useCallback(async () => {
    if (!user) {
      setIsLoginDialogOpen(true)
      return
    }
    await updateCardCount(amountOwned - 1)
  }, [updateCardCount])

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
    <div className={`group flex flex-col items-center rounded-lg ${className}`}>
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
        {editable && !params.friendId ? (
          <>
            <Button variant="ghost" size="icon" onClick={removeCard} className="rounded-full" tabIndex={-1}>
              <MinusIcon />
            </Button>
            <input
              min="0"
              max="99"
              type="text"
              disabled={Boolean(params.friendId)}
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
