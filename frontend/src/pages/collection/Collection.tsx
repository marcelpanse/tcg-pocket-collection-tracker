import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { use, useMemo, useState } from 'react'
import CardDetail from './CardDetail.tsx' // Import sidebar component
import { CardsTable } from './components/CardsTable.tsx'

function Collection() {
  const { ownedCards } = use(CollectionContext)

  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const getFilteredCards = useMemo(() => {
    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => ownedCards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !ownedCards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }
    if (rarityFilter.length > 0) {
      filteredCards = filteredCards.filter((card) => rarityFilter.includes(card.rarity))
    }
    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return card.name.toLowerCase().includes(searchValue.toLowerCase()) || card.card_id.toLowerCase().includes(searchValue.toLowerCase())
      })
    }

    return filteredCards
  }, [expansionFilter, rarityFilter, searchValue, ownedFilter, ownedCards])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex items-center gap-2 flex-col md:flex-row px-8">
        <SearchInput setSearchValue={setSearchValue} />
        <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />
      </div>
      <div className="items-center justify-between gap-2 flex-col md:flex-row px-8 hidden md:flex">
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
      </div>
      <div>
        <CardsTable
          cards={getFilteredCards}
          onCardClick={(cardId) => setSelectedCardId(cardId)} // Handle card clicks
        />

        <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId(null)} />
      </div>
    </div>
  )
}

export default Collection
