import { getCardById } from '@/lib/CardsDB.ts'
import type { Card } from '@/types'
import { useLocation } from 'react-router'

function CardDetail() {
  const location = useLocation()
  let card: Card

  if (!location.state) {
    card = getCardById(location.pathname.split('/').pop() || '') || {
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
  } else {
    card = location.state.card
  }

  return (
    <div className="flex flex-col p-5 lg:flex-row rounded-4xl max-w-7xl mx-auto">
      {/* Fancy Card Section */}
      <div className="flex justify-center lg:w-1/2">
        <img src={`/images/${card.image.split('/').at(-1)}`} alt={card.name} className="rounded-lg shadow-lg" />
      </div>
      {/* Card Details Section */}
      <div className="lg:flex-1 p-7 bg-gray-50 rounded-4xl shadow-md">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">
          {card.name} {card.rarity}
        </h1>
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
        <p className="text-gray-600 text-lg mb-1">
          <strong>Rarity:</strong> {card.rarity}
        </p>

        {/* Additional Information */}
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
  )
}

export default CardDetail
