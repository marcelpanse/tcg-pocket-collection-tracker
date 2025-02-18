import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById } from '@/lib/CardsDB.ts'
import type { Card } from '@/types'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId, onClose }: CardDetailProps) {
  const card: Card = getCardById(cardId) || {
    card_id: '',
    name: 'Unknown',
    image: '',
    rarity: '',
    hp: '0',
    card_type: '',
    evolution_type: '',
    ex: 'false',
    crafting_cost: 0,
    artist: '',
    set_details: '',
    expansion: '',
    pack: '',
    weakness: '',
    retreat: '',
    ability: { name: '', effect: '' },
    probability: { '1-3 card': '', '4 card': '', '5 card': '' },
    attacks: [],
    fullart: 'false',
    alternate_versions: [],
  }

  return (
    <Sheet
      open={!!cardId}
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(onClose, 200) // Delay closing for smooth animation
        } else {
          onClose() // Keep open logic the same
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out">
        <SheetHeader>
          <SheetTitle>
            {card.name} {card.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <FancyCard card={card} selected={true} />

          <div className="p-4 w-full">
            <p className="text-gray-600 text-lg mb-1">
              <strong>HP:</strong> {card.hp}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Card Type:</strong> {card.card_type}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Evolution Type:</strong> {card.evolution_type}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>EX:</strong> {card.ex}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Crafting Cost:</strong> {card.crafting_cost}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Artist:</strong> {card.artist}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Set Details:</strong> {card.set_details}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Expansion:</strong> {card.expansion}
            </p>
            <p className="text-gray-600 text-lg mb-1">
              <strong>Pack:</strong> {card.pack}
            </p>

            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800">Details</h2>
              <p className="text-gray-600">
                <strong>Weakness:</strong> {card.weakness || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Retreat:</strong> {card.retreat || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Ability:</strong> {card.ability?.name || 'No ability'}
              </p>
              <p className="text-gray-600">
                <strong>Ability Effect:</strong> {card.ability?.effect || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Probability (1-3 cards):</strong> {card.probability?.['1-3 card'] || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Probability (4 cards):</strong> {card.probability?.['4 card'] || 'N/A'}
              </p>
              <p className="text-gray-600">
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
