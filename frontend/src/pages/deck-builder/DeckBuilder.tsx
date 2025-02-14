import CustomFancyCard from '@/components/CustomFancyCard.tsx'
import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import type { Card as CardType } from '@/types'
import { PlusIcon } from 'lucide-react'
import { use, useCallback, useMemo, useState } from 'react'
import { CardsTable } from './components/CardsTable.tsx'

function DeckBuilder() {
  const { ownedCards } = use(CollectionContext)

  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [selectedCards, setSelectedCards] = useState<CardType[]>([])

  const getFilteredCards = useMemo(() => {
    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => ownedCards.find((oc) => oc.card_id === card.card_id))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !ownedCards.find((oc) => oc.card_id === card.card_id))
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

  const handleCardClick = (card: CardType) => {
    setSelectedCards((prevSelectedCards) => {
      const cardIndex = prevSelectedCards.findIndex((c) => c === card)
      if (cardIndex !== -1) {
        const newSelectedCards = [...prevSelectedCards]
        newSelectedCards.splice(cardIndex, 1)
        return newSelectedCards
      } else if (prevSelectedCards.length < 20) {
        return [...prevSelectedCards, card]
      }
      return prevSelectedCards
    })
  }

  const handleDeckCardClick = useCallback((card: CardType) => {
    setSelectedCards((prevSelectedCards) => {
      const cardCount = prevSelectedCards.filter((c) => c.card_id === card.card_id).length
      if (prevSelectedCards.length < 20 && cardCount < 2) {
        const newSelectedCards = [...prevSelectedCards, card]
        newSelectedCards.sort((a, b) => a.card_id.localeCompare(b.card_id))
        return newSelectedCards
      }
      return prevSelectedCards
    })
  }, [])

  return (
    <article className="flex px-5 max-w-[100rem] mx-auto gap-10">
      <section className="flex flex-col gap-y-1 w-full">
        <div className="flex items-center gap-2 flex-col md:flex-row mx-auto">
          <SearchInput setSearchValue={setSearchValue} />
          <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />
        </div>
        <div className="flex items-center justify-between gap-2 flex-col md:flex-row px-8 pb-8 mx-auto">
          <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
          <RarityFilter setRarityFilter={setRarityFilter} />
        </div>
        <CardsTable cards={getFilteredCards} onCardClick={handleDeckCardClick} />
      </section>
      <section className="border-2 border-gray-200 w-full rounded-4xl grid grid-cols-5 grid-rows-4 gap-2 p-7">
        {selectedCards.map((card, index) => (
          <button type="button" key={index} onClick={() => handleCardClick(card)} className="w-full h-full">
            <CustomFancyCard card={card} selected={true} />
          </button>
        ))}
        {Array.from({ length: 20 - selectedCards.length }).map((_, index) => (
          <button type="button" key={index} className="bg-gray-200 aspect-[367/512] rounded-md w-full flex items-center justify-center inner-custom">
            <PlusIcon className="h-12 w-12" color="gray" />
          </button>
        ))}
      </section>
    </article>
  )
}

export default DeckBuilder
