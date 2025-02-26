import { BatchUpdateDialog } from '@/components/BatchUpdateDialog'
import { updateMultipleCards } from '@/components/Card.tsx'
import { CardsTable } from '@/components/CardsTable.tsx'
import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
// import CardTracker from '@/components/cardTracker.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { useMemo, useState } from 'react'
import { useContext } from 'react'

function Collection() {
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)
  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const { user } = useContext(UserContext)

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

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex items-center gap-2 flex-col md:flex-row px-8">
        <SearchInput setSearchValue={setSearchValue} />
        <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />
      </div>
      <div className="items-center justify-between gap-2 flex-col md:flex-row px-8 md:flex">
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
        {/*TODO: NOT READY YET, FEEL FREE TO HELP*/}
        {/*<CardTracker />*/}
        <BatchUpdateDialog filteredCards={getFilteredCards} onBatchUpdate={handleBatchUpdate} disabled={getFilteredCards.length === 0} />
      </div>
      <div>
        <CardsTable cards={getFilteredCards} />
      </div>
    </div>
  )
}

export default Collection
