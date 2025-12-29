import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import SearchInput from '@/components/filters/SearchInput'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMyDecks } from '@/services/decks/useDeck'
import sampleDecks8 from '../../../assets/decks/decks-game8.json'
import { DeckItem, type IDeck } from './DeckItem'

export const rankOrder: Record<string, number> = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  'A+': 4,
  S: 5,
}

export default function Decks() {
  const decksMy = useMyDecks()

  const decksMeta8 = sampleDecks8 as IDeck[]

  const [searchValue, setSearchValue] = useState('')

  const filteredAndSortedDecks = decksMeta8
    .filter((deck) => deck.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort((a, b) => (rankOrder[b.rank] ?? 999) - (rankOrder[a.rank] ?? 999))

  const [tab, setTab] = useState('my')

  if (decksMy.isLoading || !decksMy.data) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-[900px] px-1">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex gap-4 mb-2">
          <TabsTrigger value="my">My decks</TabsTrigger>
          <TabsTrigger value="game8">Featured decks</TabsTrigger>
          <TabsTrigger value="community">Community decks</TabsTrigger>
        </TabsList>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
          <SearchInput className="w-full sm:max-w-96" setValue={setSearchValue} />
          <Link to="/decks/edit" className="w-full sm:max-w-48">
            <Button className="w-full">
              New deck
              <ChevronRight />
            </Button>
          </Link>
        </div>
        <TabsContent value="my" className="flex flex-col gap-2">
          {decksMy.data.map((deck) => (
            <div key={deck.id} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-md p-2">
              <div className="flex flex-wrap gap-1 items-center justify-center w-10">
                {deck.energy.map((energy) => (
                  <img key={energy} src={`/images/energy/${energy}.webp`} alt={energy} className="size-4" />
                ))}
              </div>
              <h2 className="font-semibold">{deck.name}</h2>
              <Link className="ml-auto" to={`/decks/edit/${deck.id}`}>
                <Button>
                  Edit
                  <ChevronRight />
                </Button>
              </Link>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="game8">
          {filteredAndSortedDecks.map((deck) => (
            <DeckItem key={deck.name} deck={deck} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
