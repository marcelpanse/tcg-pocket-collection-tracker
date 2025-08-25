import i18n from 'i18next'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { use, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import FancyCard from '@/components/FancyCard.tsx'
import { Button } from '@/components/ui/button.tsx'
import { supabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { type User, UserContext } from '@/lib/context/UserContext.ts'
import { updateCollectionCache } from '@/lib/fetchCollection.ts'
import { getCardNameByLang } from '@/lib/utils'
import type { Card as CardType, CollectionRow } from '@/types'

interface CardProps {
  card: CardType
  useMaxWidth?: boolean
  editable?: boolean
  onImageClick?: () => void
}

// keep track of the debounce timeouts for each card
const _inputDebounce: Record<string, number | null> = {}

export function Card({ card, onImageClick, useMaxWidth = false, editable = true }: CardProps) {
  const params = useParams()

  const { user, setIsLoginDialogOpen } = use(UserContext)
  const { ownedCards, setOwnedCards, setSelectedCardId } = use(CollectionContext)
  const [amountOwned, setAmountOwned] = useState(card.amount_owned || 0)
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

  const updateCardCount = useCallback(
    async (cardId: string, newAmountIn: number) => {
      const newAmount = Math.max(0, newAmountIn)
      setAmountOwned(newAmount)

      if (_inputDebounce[cardId]) {
        window.clearTimeout(_inputDebounce[cardId])
      }
      _inputDebounce[cardId] = window.setTimeout(async () => {
        if (!user || !user.user.email) {
          throw new Error('User not logged in')
        }

        const ownedCard = ownedCards.find((row) => row.card_id === cardId)
        if (ownedCard) {
          ownedCard.amount_owned = newAmount
        } else {
          ownedCards.push({ email: user.user.email, card_id: cardId, amount_owned: newAmount, updated_at: new Date().toISOString() })
        }

        const { error } = await supabase
          .from('collection')
          .upsert({ card_id: cardId, amount_owned: newAmount, email: user.user.email, updated_at: new Date().toISOString() })
        if (error) {
          throw new Error('Error updating collection')
        }

        updateCollectionCache(ownedCards, user.user.email)
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

  if (card.linkedCardID) {
    return null
  }

  return (
    <div className={`group flex w-fit ${!useMaxWidth ? 'max-w-32 md:max-w-40' : ''} flex-col items-center rounded-lg`}>
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => {
          setSelectedCardId(card.card_id)
          onImageClick?.()
        }}
      >
        <FancyCard card={card} selected={amountOwned > 0} clickable={!useMaxWidth} />
      </button>
      <p className="max-w-[120px] md:max-w-[130px] text-[12px] pt-2 text-center font-semibold leading-tight md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">
        <span className="block md:inline">{card.card_id}</span>
        <span className="hidden md:inline"> - </span>
        <span className="block md:inline overflow-hidden text-ellipsis whitespace-nowrap">{getCardNameByLang(card, i18n.language)}</span>
      </p>

      <div className="flex items-center gap-x-1">
        {editable && !params.friendId ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => removeCard(card.card_id)} className="rounded-full" tabIndex={-1}>
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => addCard(card.card_id)} tabIndex={-1}>
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
  const cardArray = cardIds.map((cardId) => ({ card_id: cardId, amount_owned: newAmount, email: user.user.email, updated_at: new Date().toISOString() }))
  const { error } = await supabase.from('collection').upsert(cardArray)
  if (error) {
    throw new Error('Error bulk updating collection')
  }

  updateCollectionCache(ownedCardsCopy, user.user.email)

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
        updated_at: new Date().toISOString(),
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

  const counts = new Map()
  for (const cardId of cardIds) {
    counts.set(cardId, (counts.get(cardId) || 0) + incrementAmount)
  }

  const ownedCardsCopy = [...ownedCards]
  const cardArray: CollectionRow[] = []

  for (const [cardId, increment] of counts) {
    const ownedCard = ownedCardsCopy.find((row) => row.card_id === cardId)

    if (ownedCard) {
      console.log('Incrementing existing card:', cardId, 'from', ownedCard.amount_owned, 'to', ownedCard.amount_owned + increment)
      ownedCard.amount_owned += increment
      ownedCard.updated_at = new Date().toISOString()
      cardArray.push(ownedCard)
    } else if (!ownedCard && increment > 0) {
      console.log('Adding new card:', cardId, 'with amount', increment)
      const card: CollectionRow = {
        email: user.user.email,
        card_id: cardId,
        amount_owned: increment,
        updated_at: new Date().toISOString(),
      }
      ownedCardsCopy.push(card)
      cardArray.push(card)
    }
  }

  const { error } = await supabase.from('collection').upsert(cardArray)
  if (error) {
    throw new Error(`Error bulk updating collection: ${error.message}`)
  }

  updateCollectionCache(ownedCardsCopy, user.user.email)

  setOwnedCards([...ownedCardsCopy]) // rerender the component

  return cardArray
}
