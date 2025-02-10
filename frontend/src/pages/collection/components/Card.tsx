import FancyCard from '@/components/FancyCard'
import { Button } from '@/components/ui/button'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { Card as CardType } from '@/types'
import { ID } from 'appwrite'
import { MinusIcon, PlusIcon } from 'lucide-react'
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
    <div className="group flex w-fit flex-col items-center rounded-lg">
      <FancyCard card={card} selected={amountOwned > 0} />
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <div className="flex items-center gap-x-1">
        <Button variant="ghost" size="icon" onClick={() => removeCard(card.card_id)} className="rounded-full">
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
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => addCard(card.card_id)}>
          <PlusIcon />
        </Button>
      </div>
    </div>
  )
}
