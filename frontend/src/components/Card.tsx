import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { supabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { type User, UserContext } from '@/lib/context/UserContext.ts'
import type { Card as CardType } from '@/types'
import type { CollectionRow } from '@/types'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { use, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'

interface Props {
  card: CardType
  useMaxWidth?: boolean
}

// keep track of the debounce timeouts for each card
const _inputDebounce: Record<string, number | null> = {}

export function Card({ card, useMaxWidth = false }: Props) {
  const params = useParams()

  if (card.linkedCardID) {
    return null
  }

  const { user, setIsLoginDialogOpen } = use(UserContext)
  const { ownedCards, setOwnedCards, setSelectedCardId } = use(CollectionContext)
  const [amountOwned, setAmountOwned] = useState(card.amount_owned || 0)
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

  const updateCardCount = useCallback(
    async (cardId: string, newAmount: number) => {
      setAmountOwned(Math.max(0, newAmount))

      if (_inputDebounce[cardId]) {
        window.clearTimeout(_inputDebounce[cardId])
      }
      _inputDebounce[cardId] = window.setTimeout(async () => {
        if (!user || !user.user.email) {
          throw new Error('User not logged in')
        }

        const ownedCard = ownedCards.find((row) => row.card_id === cardId)
        if (ownedCard) {
          ownedCard.amount_owned = Math.max(0, newAmount)
        } else {
          ownedCards.push({ email: user.user.email, card_id: cardId, amount_owned: newAmount })
        }

        const { error } = await supabase.from('collection').upsert({ card_id: cardId, amount_owned: newAmount, email: user.user.email })
        if (error) {
          throw new Error('Error updating collection')
        }
      }, 1000)
    },
    [ownedCards, user, setOwnedCards, amountOwned],
  )

  const addCard = useCallback(
    async (cardId: string) => {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      await updateCardCount(cardId, amountOwned + 1)
    },
    [updateCardCount],
  )

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      await updateCardCount(cardId, amountOwned - 1)
    },
    [updateCardCount],
  )

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      await updateCardCount(card.card_id, value)
    }
  }

  return (
    <div className={`group flex w-fit ${!useMaxWidth ? 'max-w-32 md:max-w-40' : ''} flex-col items-center rounded-lg cursor-pointer`}>
      <div onClick={() => setSelectedCardId(card.card_id)}>
        <FancyCard card={card} selected={amountOwned > 0} />
      </div>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>

      <div className="flex items-center gap-x-1">
        {!params.friendId && (
          <Button variant="ghost" size="icon" onClick={() => removeCard(card.card_id)} className="rounded-full" tabIndex={-1}>
            <MinusIcon />
          </Button>
        )}
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
        {!params.friendId && (
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => addCard(card.card_id)} tabIndex={-1}>
            <PlusIcon />
          </Button>
        )}
      </div>
    </div>
  )
}

export const updateMultipleCards = async (
  cardIds: string[],
  newAmount: number,
  ownedCards: CollectionRow[],
  setOwnedCards: React.Dispatch<React.SetStateAction<CollectionRow[]>>,
  user: User | null,
) => {
  if (!user || !user.user.email) {
    throw new Error('User not logged in')
  }
  if (newAmount < 0) {
    throw new Error('New amount cannot be negative')
  }

  const ownedCardsCopy = [...ownedCards]

  // update into the database
  const cardArray = cardIds.map((cardId) => ({ card_id: cardId, amount_owned: newAmount, email: user.user.email }))
  const { error } = await supabase.from('collection').upsert(cardArray)
  if (error) {
    throw new Error('Error bulk updating collection')
  }

  // update the UI
  for (const cardId of cardIds) {
    const ownedCard = ownedCardsCopy.find((row) => row.card_id === cardId)

    if (ownedCard) {
      console.log('Updating existing card:', cardId)
      ownedCard.amount_owned = newAmount
    } else if (!ownedCard) {
      console.log('Adding new card:', cardId)
      ownedCardsCopy.push({
        email: user.user.email,
        card_id: cardId,
        amount_owned: newAmount,
      })
    }
  }
  setOwnedCards([...ownedCardsCopy]) // rerender the component
}
export const incrementMultipleCards = async (
  cardIds: string[],
  incrementAmount: number,
  ownedCards: CollectionRow[],
  setOwnedCards: React.Dispatch<React.SetStateAction<CollectionRow[]>>,
  user: User | null,
) => {
  if (!user || !user.user.email) {
    throw new Error('User not logged in')
  }

  const ownedCardsCopy = [...ownedCards]
  const cardArray: CollectionRow[] = []

  for (const cardId of cardIds) {
    const ownedCard = ownedCardsCopy.find((row) => row.card_id === cardId)
    const currentAmount = ownedCard?.amount_owned || 0
    const newAmount = Math.max(0, currentAmount + incrementAmount)

    const duplicateScannedCard = cardArray.find((row) => row.card_id === cardId)
    if (duplicateScannedCard) {
      duplicateScannedCard.amount_owned = newAmount
    } else {
      cardArray.push({ card_id: cardId, amount_owned: newAmount, email: user.user.email })
    }

    if (ownedCard) {
      console.log('Incrementing existing card:', cardId, 'from', currentAmount, 'to', newAmount)
      ownedCard.amount_owned = newAmount
    } else if (!ownedCard && newAmount > 0) {
      console.log('Adding new card:', cardId, 'with amount', newAmount)
      ownedCardsCopy.push({
        email: user.user.email,
        card_id: cardId,
        amount_owned: newAmount,
      })
    }
  }

  const { error } = await supabase.from('collection').upsert(cardArray)
  if (error) {
    throw new Error('Error bulk updating collection')
  }
  setOwnedCards([...ownedCardsCopy]) // rerender the component
}
