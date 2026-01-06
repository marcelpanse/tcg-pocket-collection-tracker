import { Slot } from '@radix-ui/react-slot'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Heart, HeartMinus, HeartPlus } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { CardLine } from '@/components/CardLine'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { showCardType } from '@/components/utils'
import { getCardByInternalId } from '@/lib/CardsDB'
import { cn } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import { useCollection } from '@/services/collection/useCollection'
import { getDeck } from '@/services/decks/deckService'
import { useDeckLiked, useLikeDeck } from '@/services/decks/useDeck'
import { getDeckCardCounts, getMissingCardsCount } from './utils'

export default function DeckView() {
  const { id: deckId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

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

  const isOwn = deck.email !== undefined && deck.email === account?.email

  return (
    <div className="flex flex-col mx-auto max-w-sm p-2 rounded border border-neutral-700">
      <h2 className="text-lg font-semibold">{deck.name}</h2>
      <div className="flex items-center gap-2">
        <h3>Energy</h3>
        <span className="inline-flex gap-1">
          {deck.energy.map((x) => (
            <span key={x}>{showCardType(x)}</span>
          ))}
        </span>
      </div>
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
      <div className="flex items-center mt-2 justify-between">
        {deck.is_public ? (
          deck.email !== undefined && deck.email === account?.email ? (
            <p className="flex items-center gap-1">
              <Heart className="size-[1em]" />
              <span>{deck.likes}</span>
            </p>
          ) : (
            <Button
              variant="ghost"
              className="group"
              onClick={() => likeMutation.mutate(!liked)}
              disabled={likeMutation.isPending}
              isPending={likeMutation.isPending}
            >
              <Heart className={cn('group-hover:hidden', liked && 'fill-current')} />
              <Slot className="hidden group-hover:block">{liked ? <HeartMinus /> : <HeartPlus />}</Slot>
              {deck.likes !== undefined && <span>{deck.likes}</span>}
            </Button>
          )
        ) : (
          <span className="italic text-neutral-400 text-sm">Private</span>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft /> Back
          </Button>

          <Link to={`/decks/edit/${isOwn ? deck.id : ''}`} state={isOwn ? deck : { ...deck, id: undefined }}>
            <Button>
              {isOwn ? 'Edit' : 'Copy and edit'}
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
