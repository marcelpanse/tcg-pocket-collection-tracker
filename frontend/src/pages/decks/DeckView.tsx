import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, Heart, HeartMinus, HeartPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { CardLine } from '@/components/CardLine'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { showCardType } from '@/components/utils'
import { getCardByInternalId } from '@/lib/CardsDB'
import { cn } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import { useCollection } from '@/services/collection/useCollection'
import { getDeck } from '@/services/decks/deckService'
import type { Deck } from '@/types'
import { getDeckCardCounts, getMissingCardsCount } from './utils'

export default function DeckView() {
  const { id: deckId } = useParams()
  const location = useLocation()

  const { data: account } = useAccount()
  const { data: ownedCards } = useCollection()

  const shouldFetch = !location.state && deckId !== undefined
  const [deck, setDeck] = useState<Deck>(location.state ?? ({ is_public: false, name: 'New deck', energy: [], cards: [] } satisfies Deck))
  const [isLoading, setIsLoading] = useState(shouldFetch)
  const [isError, setIsError] = useState(false)
  useEffect(() => {
    if (shouldFetch) {
      setIsLoading(true)
      setIsError(false)
      getDeck(Number(deckId))
        .then((deck) => {
          setDeck(deck)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          setIsError(true)
        })
    }
  }, [shouldFetch, deckId])

  const [liked, setLiked] = useState(false)
  const like = () => setLiked(true)
  const unlike = () => setLiked(false)

  if (isLoading) {
    return <Spinner size="lg" overlay />
  }

  if (isError) {
    return 'Error'
  }

  const cards = getDeckCardCounts(deck.cards)
  const missingCards = ownedCards ? getMissingCardsCount(cards, ownedCards) : 0

  return (
    <div className="flex flex-col mx-auto max-w-sm p-2 rounded border border-neutral-700">
      <h2 className="text-lg font-semibold">{deck.name}</h2>
      <p className="flex items-center gap-2">
        <h3>Energy</h3>
        <span className="inline-flex gap-1">{deck.energy.map(showCardType)}</span>
      </p>
      <h3>Cards {missingCards > 0 && <span className="text-neutral-400 text-sm"> ({missingCards} missing)</span>}</h3>
      <ul className="overflow-y-auto space-y-1">
        {cards.map(([id, amount]) => {
          const card = getCardByInternalId(id)
          if (!card) {
            return null
          }
          const amount_owned = ownedCards && card.alternate_versions.reduce((acc, curr) => acc + (ownedCards.get(curr)?.amount_owned ?? 0), 0)
          const owned = amount_owned !== undefined && amount_owned < amount
          return (
            <li key={id} className="flex">
              <b className="mr-2">{amount}×</b>
              <CardLine
                className={`w-full ${owned ? 'bg-red-950' : ''}`}
                card_id={getCardByInternalId(id)?.card_id as string}
                id="hidden"
                amount={owned ? 'text-red-300' : ''}
                amount_owned={amount_owned}
              />
            </li>
          )
        })}
      </ul>
      <div className="flex items-center mt-2">
        {deck.is_public ? (
          <Button variant="ghost" className="group" onClick={liked ? unlike : like}>
            <Heart className={cn('group-hover:hidden', liked && 'fill-current')} />
            <Slot className="hidden group-hover:block">{liked ? <HeartMinus /> : <HeartPlus />}</Slot>
            <span>7</span>
          </Button>
        ) : (
          <span className="italic text-neutral-400 text-sm">Private</span>
        )}
        <Link className="ml-auto" to={`/decks/edit/${deck.id ?? ''}`} state={deck}>
          <Button>
            {deck.email !== undefined && deck.email === account?.email ? 'Edit' : 'Copy and edit'}
            <ChevronRight />
          </Button>
        </Link>
      </div>
    </div>
  )
}
