import { Card as CardComponent } from '@/components/Card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById, sellableForTokensDictionary } from '@/lib/CardsDB.ts'
import type { Card } from '@/types'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId, onClose }: CardDetailProps) {
  const card: Card = getCardById(cardId) || ({} as Card)

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
          <div className="px-10 py-4 w-full">
            <CardComponent card={card} useMaxWidth />
          </div>

          <div className="p-4 w-full">
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
