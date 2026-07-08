import { Slot } from '@radix-ui/react-slot'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Heart, HeartMinus, HeartPlus } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { showCardType } from '@/components/utils'
import { getCardByInternalId } from '@/lib/CardsDB'
import { cn } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import { getDeck } from '@/services/decks/deckService'
import { useDeckLiked, useLikeDeck } from '@/services/decks/useDeck'
import { getDeckCardCounts, getMissingCardsCount, getOwnedStatus } from './utils'

export default function DeckView() {
  const { id: deckId } = useParams()
  const location = useLocation()

  const { setSelectedCardId } = useSelectedCard()

  const { data: account } = useAccount()
  const { data: ownedCards } = useCollection()

  const { data: deck, isLoading } = useQuery({
    queryKey: ['deck', Number(deckId)],
    queryFn: () => getDeck(Number(deckId)),
    placeholderData: location.state,
    throwOnError: true,
  })

  const { data: liked } = useDeckLiked(Number(deckId))
  const likeMutation = useLikeDeck(Number(deckId))

  if (isLoading) {
    return <Spinner size="lg" overlay />
  }

  if (!deck) {
    return 'Error'
  }

  const cards = getDeckCardCounts(deck.cards)
  const missingCards = ownedCards ? getMissingCardsCount(cards, ownedCards) : 0
  const cardsWithOwnedStatus = ownedCards ? getOwnedStatus(deck.cards, ownedCards) : deck.cards.map((id) => [id, true] as [number, boolean])

  const isOwn = deck.email !== undefined && deck.email === account?.email

  return (
    <div className="flex flex-col mx-auto max-w-159 p-2 sm:p-4 rounded sm:rounded-md border border-neutral-700 bg-neutral-800">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h2 className="text-xl font-semibold">{deck.name}</h2>
          <div className="flex items-center gap-2">
            <h3>Energy</h3>
            <span className="inline-flex gap-1">
              {deck.energy.map((x) => (
                <span key={x}>{showCardType(x)}</span>
              ))}
            </span>
          </div>
          <p className="text-sm text-neutral-400 mb-2">
            {deck.username && (
              <>
                Created by {deck.username}.<br />
              </>
            )}
            Last updated {deck.updated_at.toLocaleDateString()}.
          </p>
        </div>
        <div className="flex flex-row sm:flex-col gap-2">
          {deck.is_public &&
            (deck.email !== undefined && deck.email === account?.email ? (
              <p className="flex justify-center items-center gap-1 h-9 px-4 py-2">
                <Heart className="size-[1em]" />
                <span>{deck.likes}</span>
              </p>
            ) : (
              <Button
                variant="outline"
                className="group"
                onClick={() => likeMutation.mutate(!liked)}
                disabled={likeMutation.isPending}
                isPending={likeMutation.isPending}
              >
                <Heart className={cn('group-hover:hidden', liked && 'fill-current')} />
                <Slot className="hidden group-hover:block">{liked ? <HeartMinus /> : <HeartPlus />}</Slot>
                {deck.likes !== undefined && <span>{deck.likes}</span>}
              </Button>
            ))}
          <Link to={`/decks/edit/${isOwn ? deck.id : ''}`} state={isOwn ? deck : { ...deck, id: undefined }}>
            <Button variant="outline">
              {isOwn ? 'Edit' : 'Copy and edit'}
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </div>
      {missingCards > 0 && <span className="text-neutral-300 italic">{missingCards} missing cards</span>}
      <hr className="border-neutral-700 my-2" />
      <div className="flex flex-wrap gap-2">
        {cardsWithOwnedStatus.map(([id, owned]) => {
          const card = getCardByInternalId(id)
          if (!card) {
            return null
          }
          return (
            <button key={id} className="cursor-pointer" onClick={() => setSelectedCardId(id)} type="button">
              <img className={`w-28 sm:w-36 ${owned ? '' : 'grayscale'}`} src={card.image} alt={`${card.card_id} ${card.name}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
