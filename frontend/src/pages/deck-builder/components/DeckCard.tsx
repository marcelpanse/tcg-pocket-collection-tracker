import FancyCard from '@/components/FancyCard'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { Card as CardType } from '@/types'
import { ID } from 'appwrite'
import { use, useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  card: CardType
  onCardClick: (card: CardType) => void
}

// keep track of the debounce timeouts for each card
const _inputDebounce: Record<string, number | null> = {}

export function DeckCard({ card, onCardClick }: Props) {
  const { user } = use(UserContext)
  const { ownedCards, setOwnedCards } = use(CollectionContext)
  let amountOwned = useMemo(() => ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0, [ownedCards])
  const [inputValue, setInputValue] = useState(0)

  const handleCardClick = () => {
    onCardClick(card)
  }

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value, 10)
    if (!Number.isNaN(value) && value >= 0) {
      await updateCardCount(card.card_id, value)
    }
  }

  return (
    <div className="group flex w-fit flex-col items-center rounded-lg">
      <button type="button" onClick={handleCardClick}>
        <FancyCard card={card} selected={amountOwned > 0} />
      </button>
      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
        {card.card_id} - {card.name}
      </p>
      <div className="flex items-center gap-x-1">
        <input
          min="0"
          max="99"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-7 text-center border-none rounded"
          onFocus={(event) => event.target.select()}
        />
      </div>
    </div>
  )
}
