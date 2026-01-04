import type { UseQueryResult } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMyDecks, usePublicDecks } from '@/services/decks/useDeck'
import type { Deck } from '@/types'
import sampleDecks8 from '../../../assets/decks/decks-game8.json'
import { DeckItem, DeckItemGame8, type IDeck } from './DeckItem'

export const rankOrder: Record<string, number> = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  'A+': 4,
  S: 5,
}

function DeckList({ decks }: { decks: UseQueryResult<Deck[], Error> }) {
  if (decks.isLoading) {
    return <Spinner size="md" overlay />
  }
  if (decks.isError) {
    return <ErrorAlert error={decks.error} />
  }
  if (!decks.data) {
    throw new Error('Deck list assertion error')
  }
  return (
    <>
      {decks.data.map((deck) => (
        <DeckItem key={deck.id} deck={deck} />
      ))}
    </>
  )
}

export default function Decks() {
  const [page, setPage] = useState(0)

  const decksMy = useMyDecks()
  const decksPublic = usePublicDecks(page)
  const decksMeta8 = (sampleDecks8 as IDeck[]).sort((a, b) => (rankOrder[b.rank] ?? 999) - (rankOrder[a.rank] ?? 999))

  const [tab, setTab] = useState('my')

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-[900px] px-1">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex gap-4 mb-2">
          <TabsTrigger value="game8">Featured decks</TabsTrigger>
          <TabsTrigger value="my">My decks</TabsTrigger>
          <TabsTrigger value="liked">Liked decks</TabsTrigger>
          <TabsTrigger value="community">Community decks</TabsTrigger>
        </TabsList>
        <TabsContent value="game8" className="flex flex-col gap-2">
          {decksMeta8.map((deck) => (
            <DeckItemGame8 key={deck.name} deck={deck} />
          ))}
        </TabsContent>
        <TabsContent value="my" className="flex flex-col gap-2">
          <Link to="/decks/edit" className="inline-block sm:max-w-48 ml-auto">
            <Button className="w-full">
              New deck
              <ChevronRight />
            </Button>
          </Link>
          <DeckList decks={decksMy} />
        </TabsContent>
        <TabsContent value="liked" className="flex flex-col gap-2">
          <DeckList decks={decksMy} />
        </TabsContent>
        <TabsContent value="community" className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>Page {page + 1}</span>
            <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page <= 0}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev + 1, 0))} disabled={decksPublic.data?.length === 0}>
              <ChevronRight />
            </Button>
          </div>
          <DeckList decks={decksPublic} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
