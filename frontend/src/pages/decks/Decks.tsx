import { useState } from 'react'
import SearchInput from '@/components/filters/SearchInput'
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

function Decks() {
  const decksMeta8 = sampleDecks8 as IDeck[]

  const [searchValue, setSearchValue] = useState('')

  const filteredAndSortedDecks = decksMeta8
    .filter((deck) => deck.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort((a, b) => (rankOrder[b.rank] ?? 999) - (rankOrder[a.rank] ?? 999))

  return (
    <div className="flex flex-col gap-4 px-1 sm:px-8 md:mx-auto max-w-[1360px]">
      <SearchInput className="w-full sm:w-96" setSearchValue={setSearchValue} />
      {filteredAndSortedDecks.map((deck) => (
        <DeckItem key={deck.name} deck={deck} />
      ))}
    </div>
  )
}
export default Decks
