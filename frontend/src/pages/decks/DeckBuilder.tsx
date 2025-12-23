import { SquareMinus, SquarePlus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useLocation, useNavigate, useParams } from 'react-router'
import { CardLine } from '@/components/CardLine'
import { CardsTable } from '@/components/CardsTable'
import FancyCard from '@/components/FancyCard'
import { ToggleFilter } from '@/components/Filters'
import FiltersPanel from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { showCardType } from '@/components/utils'
import { getCardByInternalId } from '@/lib/CardsDB'
import { type Filters, type FiltersAll, getFilteredCards } from '@/lib/filters'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import { useDeck, useDeleteDeck, useUpdateDeck } from '@/services/decks/useDeck'
import { type Deck, energies } from '@/types'

const defaultFilters: Filters = {
  search: '',
  expansion: 'all',
  cardType: [],
  rarity: [],
  sortBy: 'expansion-newest',
  allTextSearch: false,
}

function getDeckCardCounts(cards: number[]) {
  const map = new Map<number, number>()
  for (const id of cards) {
    map.set(id, (map.get(id) ?? 0) + 1)
  }
  return [...map].toSorted(([a, _n1], [b, _n2]) => a - b)
}

export default function DeckBuilder() {
  const { id: deckId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: savedDeck, isLoading } = useDeck(deckId === undefined ? undefined : Number(deckId))

  const updateDeckMutation = useUpdateDeck()
  const deleteDeckMutation = useDeleteDeck()

  const filtersCollapsed = useMediaQuery({ query: '(max-width: 1024px)' }) // tailwind "lg"
  const deckCollapsed = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const { data: ownedCards } = useCollection()
  const { setSelectedCardId } = useSelectedCard()

  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false) // used only on mobile
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  const filteredCards = getFilteredCards({ ...filters, deckbuildingMode: true }, ownedCards ?? new Map())

  const activeFilters = () => {
    let res = 0
    for (const key in filters) {
      const k = key as keyof FiltersAll
      if (filters[k] !== defaultFilters[k]) {
        res++
      }
    }
    return res
  }

  const [deck, setDeck] = useState<Deck>(location.state ?? ({ is_public: false, name: 'New deck', energy: [], cards: [] } satisfies Deck))

  useEffect(() => {
    if (deckId && savedDeck) {
      setDeck(savedDeck)
    }
  }, [deckId, savedDeck])

  const [isDeckSheetOpen, setIsDeckSheetOpen] = useState(deckCollapsed && !!location.state) // used only on mobile
  const cards = getDeckCardCounts(deck.cards)

  const missingCards = ownedCards
    ? cards.reduce(
        (acc, [id, amount]) =>
          acc +
          Math.max(0, amount - (getCardByInternalId(id)?.alternate_versions?.reduce((acc2, id2) => acc2 + (ownedCards.get(id2)?.amount_owned ?? 0), 0) ?? 0)),
        0,
      )
    : 0

  const addCard = (id: number) => {
    setDeck((deck) => ({ ...deck, cards: [...deck.cards, id] }))
  }

  const removeCard = (id: number) => {
    setDeck((deck) => {
      const idx = deck.cards.indexOf(id)
      if (idx === -1) {
        console.error(`Can't remove card ${id}: card not in the deck`)
        return deck
      }
      return { ...deck, cards: deck.cards.filter((_, i) => i !== idx) }
    })
  }

  const onSave = () => {
    updateDeckMutation.mutateAsync(deck).then((deck) => {
      console.log(deck)
      setDeck(deck) // fill id and email
    })
  }

  const onDelete = () => {
    if (!deck.id) {
      throw new Error("Can't delete deck that has no id")
    }
    deleteDeckMutation.mutateAsync(deck.id).then(() => {
      console.log('Successfully deleted deck')
      navigate('/decks')
    })
  }

  if (deckId !== undefined && !isLoading && !savedDeck) {
    return 'Error'
  }

  const deckNode = (
    <div className="flex flex-col [&>h2]:text-lg [&>h2:not(:first-child)]:mt-2">
      <h2>Title</h2>
      <Input className="bg-neutral-800" type="text" value={deck.name} onChange={(e) => setDeck((deck) => ({ ...deck, name: e.target.value }))} />
      <h2>Energy</h2>
      <ToggleFilter options={energies} value={deck.energy} onChange={(energy) => setDeck((deck) => ({ ...deck, energy }))} show={showCardType} />
      <h2>Cards</h2>
      <p className="text-neutral-400">
        <span className={`${deck.cards.length < 20 ? 'text-red-300' : ''}`}>{deck.cards.length}</span>
        <span className="text-sm">/20 cards</span>
        {missingCards > 0 && <span className="text-sm"> ({missingCards} missing)</span>}
      </p>
      <ul className="overflow-y-auto space-y-1">
        {cards.map(([id, amount]) => {
          const card = getCardByInternalId(id)
          if (!card) {
            return null
          }
          const amount_owned = ownedCards && card.alternate_versions.reduce((acc, curr) => acc + (ownedCards.get(curr)?.amount_owned ?? 0), 0)
          const owned = amount_owned !== undefined && amount_owned < amount
          return (
            <li key={id} className="flex gap-1 rounded">
              <button type="button" className="enabled:cursor-pointer" onClick={() => removeCard(id)}>
                <SquareMinus className="size-5" />
              </button>
              <button type="button" className="enabled:cursor-pointer disabled:opacity-50" onClick={() => addCard(id)} disabled={amount >= 2}>
                <SquarePlus className="size-5" />
              </button>
              <b className="mx-2">{amount}×</b>
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
      <div className="flex items-center gap-x-2 mt-2">
        <input
          className="size-5"
          name="is_public"
          type="checkbox"
          checked={deck.is_public}
          onChange={() => setDeck((deck) => ({ ...deck, is_public: !deck.is_public }))}
        />
        <label htmlFor="is_public">Public</label>
      </div>
      <div className="flex justify-between mt-2">
        <Button className="w-fit" onClick={onSave}>
          Save
        </Button>
        <Button variant="destructive" className="w-fit" disabled={!deck.id} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full mx-auto flex px-2 gap-4 justify-center">
      <title>{`${deck.name} – TCG Pocket Collection Tracker`}</title>
      {filtersCollapsed ? (
        <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersPanel
              className="flex flex-col w-80 h-fit gap-2"
              filters={filters}
              setFilters={(obj) => setFilters((old) => ({ ...old, ...obj }))}
              clearFilters={() => setFilters(defaultFilters)}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <FiltersPanel
          className="flex flex-col w-80 h-fit gap-2"
          filters={filters}
          setFilters={(obj) => setFilters((old) => ({ ...old, ...obj }))}
          clearFilters={() => setFilters(defaultFilters)}
        />
      )}
      <CardsTable
        className="w-full lg:w-152 px-2"
        cards={filteredCards}
        render={(card) => {
          const amount = cards.find(([id, _]) => card.internal_id === id)?.[1] ?? 0
          const amount_owned = ownedCards
            ? Math.min(
                2,
                card.alternate_versions.reduce((acc, curr) => acc + (ownedCards.get(curr)?.amount_owned ?? 0), 0),
              )
            : 2
          return (
            <>
              <button type="button" className="cursor-pointer" key={card.card_id} onClick={() => setSelectedCardId(card.internal_id)}>
                <FancyCard card={card} selected={true} />
              </button>
              <div className="flex gap-1 justify-center">
                <button
                  type="button"
                  className="enabled:cursor-pointer disabled:opacity-50"
                  onClick={() => removeCard(card.internal_id)}
                  disabled={amount <= 0}
                >
                  <SquareMinus className="size-6" />
                </button>
                <span className={amount > amount_owned ? 'text-red-300' : ''}>
                  {amount}/{amount_owned ?? 2}
                </span>
                <button type="button" className="enabled:cursor-pointer disabled:opacity-50" onClick={() => addCard(card.internal_id)} disabled={amount >= 2}>
                  <SquarePlus className="size-6" />
                </button>
              </div>
            </>
          )
        }}
      >
        <div className="flex flex-col sticky top-0 z-10 bg-neutral-900 mb-2">
          {filtersCollapsed && (
            <div className="h-9 mb-2 z-10 flex overflow-hidden text-center rounded-md text-sm font-medium border shadow-sm border-neutral-700 divide-x divide-neutral-700 [&>*]:cursor-pointer [&>*]:hover:bg-neutral-600 [&>*]:hover:text-neutral-50">
              <button type="button" className="flex-1" onClick={() => setIsFiltersSheetOpen(true)}>
                Filters
                {activeFilters() > 0 && ` (${activeFilters()})`}
              </button>
              {activeFilters() > 0 && (
                <button type="button" className="group px-2" onClick={() => setFilters(defaultFilters)}>
                  <Trash2 className="stroke-neutral-200 group-hover:stroke-neutral-50" />
                </button>
              )}
            </div>
          )}
          {deckCollapsed && (
            <Button variant="outline" onClick={() => setIsDeckSheetOpen(true)}>
              Deck
            </Button>
          )}
        </div>
      </CardsTable>
      {deckCollapsed ? (
        <Sheet open={isDeckSheetOpen} onOpenChange={setIsDeckSheetOpen}>
          <SheetContent side="right" className="w-full">
            <SheetHeader>
              <SheetTitle>Deck</SheetTitle>
            </SheetHeader>
            {deckNode}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="min-w-80 md:w-108 h-fit p-2 rounded-lg border-1 border-neutral-700">{deckNode}</div>
      )}
    </div>
  )
}
