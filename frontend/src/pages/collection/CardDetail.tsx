import { Card } from '@/components/Card.tsx'
import CardCounter from '@/components/CardCounter'
import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById, sellableForTokensDictionary } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import type { Card as CardType } from '@/types'
import { useContext, useRef } from 'react'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId, onClose }: CardDetailProps) {
  const card: CardType = getCardById(cardId) || ({} as CardType)
  const { ownedCards } = useContext(CollectionContext)

  const amountOwned = ownedCards.find((row) => row.card_id === card.card_id)?.amount_owned || 0

  const cardRef = useRef<{
    updateCardCount: (newAmount: number) => void
    addCard: () => void
    removeCard: () => void
  } | null>(null)

  return (
    <Sheet open={!!cardId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {card.name} {card.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <div className="px-10 py-4">
            <FancyCard card={card} selected={true} />
            <Card ref={cardRef} card={card} hideUI={true} />
          </div>

          {/* Counter UI for adjusting card quantity */}
          <CardCounter
            cardID={card.card_id}
            count={amountOwned}
            onIncrement={() => cardRef.current?.addCard()}
            onDecrement={() => cardRef.current?.removeCard()}
            onInputChange={(value) => cardRef.current?.updateCardCount(value)}
          />

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
