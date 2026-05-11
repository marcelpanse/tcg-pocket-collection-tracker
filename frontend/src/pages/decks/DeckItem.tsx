import { Heart } from 'lucide-react'
import { Link } from 'react-router'
import type { Deck } from '@/types'

export function DeckItem({ deck }: { deck: Deck }) {
  return (
    <Link to={`/decks/${deck.id ?? ''}`} state={deck}>
      <div key={deck.id} className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md p-2">
        <div className="flex flex-wrap gap-1 items-center justify-center w-10">
          {deck.energy.map((energy) => (
            <img key={energy} src={`/images/energy/${energy}.webp`} alt={energy} className="size-4" />
          ))}
        </div>
        <div>
          <h2 className="font-semibold">{deck.name}</h2>
          <span className="text-sm text-neutral-400">Updated {deck.updated_at.toLocaleDateString()}</span>
        </div>
        {deck.likes !== undefined ? (
          <span className="ml-auto inline-flex gap-1">
            <span>{deck.likes}</span>
            <Heart />
          </span>
        ) : (
          <span className="ml-auto italic text-neutral-400 text-sm">{deck.is_public ? 'Public' : 'Private'}</span>
        )}
      </div>
    </Link>
  )
}
