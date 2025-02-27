import CardCounter from '@/components/CardCounter'
import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import { getCardById, sellableForTokensDictionary } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { Card } from '@/types'
import { ID } from 'appwrite'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId, onClose }: CardDetailProps) {
  const card: Card = getCardById(cardId) || ({} as Card)
  const { user, setIsLoginDialogOpen } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  // Determine the initial count from the collection data.
  const initialCount = ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0
  const [count, setCount] = useState<number>(initialCount)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  const updateCardCount = useCallback(
    async (newCount: number) => {
      const validatedCount = Math.max(0, newCount)
      setCount(validatedCount)

      // Debounce rapid updates so that the backend isn't spammed.
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = window.setTimeout(async () => {
        const db = await getDatabase()
        const ownedCard = ownedCards.find((row) => row.card_id === card.card_id)

        if (ownedCard) {
          ownedCard.amount_owned = validatedCount
          setOwnedCards([...ownedCards])
          await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
            amount_owned: validatedCount,
          })
        } else if (validatedCount > 0) {
          if (!user) {
            setIsLoginDialogOpen(true)
            return
          }
          const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            email: user.email,
            card_id: card.card_id,
            amount_owned: validatedCount,
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
    [ownedCards, card.card_id, user, setOwnedCards, setIsLoginDialogOpen],
  )

  const increment = () => {
    updateCardCount(count + 1)
  }

  const decrement = () => {
    if (count > 0) {
      updateCardCount(count - 1)
    }
  }

  return (
    <Sheet
      open={!!cardId}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {card.name} {card.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <div className="px-10 py-4">
            <FancyCard card={card} selected={true} />
          </div>

          {/* Counter UI for adjusting card quantity */}
          <CardCounter count={count} onIncrement={increment} onDecrement={decrement} onInputChange={updateCardCount} />
          <div className="p-4 w-full border-t border-gray-500 mt-4">
            <p className="text-lg mb-1">
              <strong>Trade tokens:</strong> {sellableForTokensDictionary[card.rarity] || 'N/A'}
            </p>
            <p className="text-lg mb-1">
              <strong>HP:</strong> {card.hp}
            </p>
            <p className="text-lg mb-1">
              <strong>Card Type:</strong> {card.card_type}
            </p>
            <p className="text-lg mb-1">
              <strong>Evolution Type:</strong> {card.evolution_type}
            </p>
            <p className="text-lg mb-1">
              <strong>EX:</strong> {card.ex}
            </p>
            <p className="text-lg mb-1">
              <strong>Crafting Cost:</strong> {card.crafting_cost}
            </p>
            <p className="text-lg mb-1">
              <strong>Artist:</strong> {card.artist}
            </p>
            <p className="text-lg mb-1">
              <strong>Set Details:</strong> {card.set_details}
            </p>
            <p className="text-lg mb-1">
              <strong>Expansion:</strong> {card.expansion}
            </p>
            <p className="text-lg mb-1">
              <strong>Pack:</strong> {card.pack}
            </p>

            <div className="mt-4">
              <h2 className="text-xl font-semibold">Details</h2>
              <p>
                <strong>Weakness:</strong> {card.weakness || 'N/A'}
              </p>
              <p>
                <strong>Retreat:</strong> {card.retreat || 'N/A'}
              </p>
              <p>
                <strong>Ability:</strong> {card.ability?.name || 'No ability'}
              </p>
              <p>
                <strong>Ability Effect:</strong> {card.ability?.effect || 'N/A'}
              </p>
              <p>
                <strong>Probability (1-3 cards):</strong> {card.probability?.['1-3 card'] || 'N/A'}
              </p>
              <p>
                <strong>Probability (4 cards):</strong> {card.probability?.['4 card'] || 'N/A'}
              </p>
              <p>
                <strong>Probability (5 cards):</strong> {card.probability?.['5 card'] || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CardDetail
