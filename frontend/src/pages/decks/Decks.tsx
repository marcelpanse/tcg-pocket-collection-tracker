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

const rankInfo: Record<string, { title: string; tooltip: string }> = {
  S: {
    title: 'Top tier',
    tooltip:
      'The best decks are in the S tier, which are decks that have amazing consistency on top of being easy to build and function with minimal difficulty.',
  },
  A: {
    title: 'Advanced Tier',
    tooltip: 'A+ Tier Decks are some of the most powerful metagame options. These can function at the highest level, but face competition against S tiers.',
  },
  'A+': {
    title: 'Basic Tier',
    tooltip: 'A Tier Decks are also powerful, and can also function at a high level, but may not be as easy to pilot as the S Tiers.',
  },
  B: { title: 'Challenger Tier', tooltip: 'B Tier Decks are decent, but would require more skill to achieve success with.' },
  C: {
    title: 'Challenger Tier',
    tooltip:
      "C Tier consists of the game's Rogue Decks. These are great for countering specific threats but require skilled pilots and specific circumstances to succeed with.",
  },
  D: {
    title: 'Challenger Tier',
    tooltip:
      'D Tier include decks that used to be stronger, and those kept to date with the latest sets, but lacks the consistency to keep up with the heavier hitters.',
  },
}

function Decks() {
  const decksMeta8 = sampleDecks8 as IDeck[]

  const [searchValue, setSearchValue] = useState('')

  const filteredAndSortedDecks = decksMeta8
    .filter((deck) => deck.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort((a, b) => {
      return (rankOrder[b.rank] ?? 999) - (rankOrder[a.rank] ?? 999)
    })

  const groupedDecks = filteredAndSortedDecks.reduce(
    (acc, deck) => {
      if (!acc[deck.rank]) {
        acc[deck.rank] = []
      }
      acc[deck.rank].push(deck)
      return acc
    },
    {} as Record<string, IDeck[]>,
  )

  return (
    <div className="px-8 md:mx-auto max-w-[1336px]">
      <SearchInput className="mb-8 w-full sm:w-96" setSearchValue={setSearchValue} />
      {Object.keys(groupedDecks)
        .sort((a, b) => (rankOrder[b] ?? 999) - (rankOrder[a] ?? 999)) // Ensure group order matches your sorting
        .map((rank) => {
          const info = rankInfo[rank] ?? { title: rank, tooltip: '' }
          return (
            <div key={rank} className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-center font-semibold text-md sm:text-lg md:text-2xl ">
                  {rank} Tier Decks ({info.title})
                </h2>
                {info.tooltip && (
                  <span className="cursor-default" title={info.tooltip}>
                    ⓘ
                  </span>
                )}
              </div>

              {groupedDecks[rank].map((deck) => (
                <DeckItem key={deck.name} deck={deck} />
              ))}
            </div>
          )
        })}
    </div>
  )
}
export default Decks
