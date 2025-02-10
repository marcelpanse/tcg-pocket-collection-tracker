import FancyCard from '@/components/FancyCard'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { Card as CardType } from '@/types'
import { ID } from 'appwrite'
import { use, useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  card: CardType
}

let _inputDebounce: number | null = null

export function Card({ card }: Props) {
  const { user, setIsLoginDialogOpen } = use(UserContext)
  const { ownedCards, setOwnedCards } = use(CollectionContext)
  const amountOwned = useMemo(() => ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0, [ownedCards])
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

  const updateCardCount = useCallback(
    async (cardId: string, increment: number) => {
      console.log(`${cardId} button clicked`)
      const db = await getDatabase()
      const ownedCard = ownedCards.find((row) => row.card_id === cardId)

      if (ownedCard) {
        console.log('updating', ownedCard)
        ownedCard.amount_owned = Math.max(0, ownedCard.amount_owned + increment)
        setOwnedCards([...ownedCards])
        await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
          amount_owned: ownedCard.amount_owned,
        })
      } else if (!ownedCard && increment > 0) {
        console.log('adding new card', cardId)
        const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
          email: user?.email,
          card_id: cardId,
          amount_owned: increment,
        })
        setOwnedCards([
          ...ownedCards,
          {
            $id: newCard.$id,
            email: newCard.email,
            card_id: newCard.card_id,
            amount_owned: newCard.amount_owned,
          },
        ])
      }
      setInputValue(Math.max(0, amountOwned + increment))
    },
    [ownedCards, user, setOwnedCards, amountOwned],
  )

  const addCard = useCallback(
    async (cardId: string) => {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      await updateCardCount(cardId, 1)
    },
    [updateCardCount],
  )

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      if (amountOwned > 0) {
        await updateCardCount(cardId, -1)
      }
    },
    [updateCardCount, amountOwned],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      setInputValue(value)
      if (_inputDebounce) {
        window.clearTimeout(_inputDebounce)
      }
      _inputDebounce = window.setTimeout(async () => {
        await updateCardCount(card.card_id, value - amountOwned)
      }, 300)
    }
  }

  return (
    <div className="group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg">
      <FancyCard card={card} selected={amountOwned > 0} />
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]">
        {card.card_id} - {card.name}
      </p>
      <div className="flex items-center gap-x-4">
        <button
          name="remove"
          aria-label="remove 1 card"
          type="button"
          onClick={() => removeCard(card.card_id)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition duration-200 hover:bg-red-400 focus:outline-none"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10z" />
          </svg>
        </button>
        <input type="text" value={inputValue} onChange={handleInputChange} className="w-7 text-center border border-gray-300 rounded" />
        <button
          name="add"
          aria-label="add 1 card"
          type="button"
          onClick={() => addCard(card.card_id)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white transition duration-200 hover:bg-green-400 focus:outline-none"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
