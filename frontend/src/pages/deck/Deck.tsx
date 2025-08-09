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

function Deck() {
  const decksMeta8 = sampleDecks8 as IDeck[]

  const [searchValue, setSearchValue] = useState('')

  const filteredAndSortedDecks = decksMeta8
    .filter((deck) => deck.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort((a, b) => {
      return (rankOrder[b.rank] ?? 999) - (rankOrder[a.rank] ?? 999)
    })

  return (
    <div className="px-8 md:mx-auto max-w-[1336px]">
      <div className="flex">
        <SearchInput setSearchValue={setSearchValue} />
      </div>
      {filteredAndSortedDecks.map((deck: IDeck) => {
        return <DeckItem key={deck.name} deck={deck} />
      })}
    </div>
  )
}
export default Deck
