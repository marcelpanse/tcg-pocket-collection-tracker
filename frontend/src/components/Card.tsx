import CardCounter from '@/components/CardCounter.tsx'
import FancyCard from '@/components/FancyCard.tsx'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { Card as CardType } from '@/types'
import type { CollectionRow } from '@/types'
import { ID } from 'appwrite'
import { use, useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  card: CardType
}

// keep track of the debounce timeouts for each card
const _inputDebounce: Record<string, number | null> = {}

export function Card({ card }: Props) {
  const { user, setIsLoginDialogOpen } = use(UserContext)
  const { ownedCards, setOwnedCards, setSelectedCardId } = use(CollectionContext)
  let amountOwned = useMemo(() => ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0, [ownedCards])
  const [inputValue, setInputValue] = useState(0)

  useEffect(() => {
    setInputValue(amountOwned)
  }, [amountOwned])

  const updateCardCount = useCallback(
    async (cardId: string, newAmount: number) => {
      // we need to optimistically update the amountOwned so we can use it in the addCard/removeCard functions since the setState won't be updated yet if you click fast.
      amountOwned = Math.max(0, newAmount)
      setInputValue(amountOwned)

      if (_inputDebounce[cardId]) {
        window.clearTimeout(_inputDebounce[cardId])
      }
      _inputDebounce[cardId] = window.setTimeout(async () => {
        const db = await getDatabase()
        const ownedCard = ownedCards.find((row) => row.card_id === cardId)

        if (ownedCard) {
          console.log('updating', ownedCard)
          ownedCard.amount_owned = Math.max(0, newAmount)
          setOwnedCards([...ownedCards])
          await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
            amount_owned: ownedCard.amount_owned,
          })
        } else if (!ownedCard && newAmount > 0) {
          console.log('adding new card', cardId)
          const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            email: user?.email,
            card_id: cardId,
            amount_owned: newAmount,
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
    [user, setIsLoginDialogOpen, updateCardCount, amountOwned],
  )

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      await updateCardCount(cardId, amountOwned - 1)
    },
    [user, setIsLoginDialogOpen, updateCardCount, amountOwned],
  )

  return (
    <div className="group flex w-fit max-w-32 md:max-w-40 flex-col items-center rounded-lg cursor-pointer">
      <div onClick={() => setSelectedCardId(card.card_id)}>
        <FancyCard card={card} selected={amountOwned > 0} />
      </div>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <CardCounter
        count={inputValue}
        onIncrement={() => addCard(card.card_id)}
        onDecrement={() => removeCard(card.card_id)}
        buttonSize="icon" // Matches small button style
        inputClassName="w-7 text-center border-none rounded" // Matches original input style
      />
    </div>
  )
}

export const updateMultipleCards = async (
  cardIds: string[],
  newAmount: number,
  ownedCards: CollectionRow[],
  setOwnedCards: React.Dispatch<React.SetStateAction<CollectionRow[]>>,
  user: { email: string } | null,
) => {
  const db = await getDatabase()
  const ownedCardsCopy = [...ownedCards]
  for (const cardId of cardIds) {
    const ownedCard = ownedCardsCopy.find((row) => row.card_id === cardId)

    if (ownedCard) {
      console.log('Updating existing card:', cardId)
      ownedCard.amount_owned = Math.max(0, newAmount)
      await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
        amount_owned: ownedCard.amount_owned,
      })
    } else if (!ownedCard && newAmount > 0) {
      console.log('Adding new card:', cardId)
      const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        card_id: cardId,
        amount_owned: newAmount,
        email: user?.email,
      })

      ownedCardsCopy.push({
        $id: newCard.$id,
        email: newCard.email,
        card_id: newCard.card_id,
        amount_owned: newCard.amount_owned,
      })
    }
  }
  setOwnedCards([...ownedCardsCopy]) // rerender the component
}
