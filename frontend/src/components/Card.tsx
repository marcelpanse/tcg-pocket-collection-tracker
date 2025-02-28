import CardCounter from '@/components/CardCounter.tsx'
import FancyCard from '@/components/FancyCard.tsx'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { Card as CardType } from '@/types'
import type { CollectionRow } from '@/types'
import { ID } from 'appwrite'
import { forwardRef, useContext, useImperativeHandle, useMemo } from 'react'

export const Card = forwardRef(({ card, hideUI = false }: { card: CardType; hideUI?: boolean }, ref) => {
  const { user, setIsLoginDialogOpen } = useContext(UserContext)
  const { ownedCards, setOwnedCards, setSelectedCardId } = useContext(CollectionContext)

  const amountOwned = useMemo(() => ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0, [ownedCards])

  const updateCardCount = async (newAmount: number) => {
    const validatedCount = Math.max(0, newAmount)

    const ownedCard = ownedCards.find((row) => row.card_id === card.card_id)

    if (ownedCard) {
      ownedCard.amount_owned = validatedCount
      setOwnedCards([...ownedCards])
    } else if (validatedCount > 0) {
      if (!user) {
        setIsLoginDialogOpen(true)
        return
      }
      setOwnedCards([
        ...ownedCards,
        {
          $id: `${card.card_id}-${user.email}`,
          email: user.email,
          card_id: card.card_id,
          amount_owned: validatedCount,
        },
      ])
    }
  }

  const addCard = () => updateCardCount(amountOwned + 1)
  const removeCard = () => updateCardCount(amountOwned - 1)

  // Expose these functions via `useImperativeHandle`
  useImperativeHandle(ref, () => ({
    updateCardCount,
    addCard,
    removeCard,
  }))

  if (hideUI) return null

  return (
    <div className="group flex w-fit max-w-32 md:max-w-40 flex-col items-center rounded-lg cursor-pointer">
      <div onClick={() => setSelectedCardId(card.card_id)}>
        <FancyCard card={card} selected={amountOwned > 0} />
      </div>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <CardCounter
        cardID={card.card_id}
        count={amountOwned}
        onIncrement={addCard}
        onDecrement={removeCard}
        buttonSize="icon"
        inputClassName="w-7 text-center border-none rounded"
      />
    </div>
  )
})

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
