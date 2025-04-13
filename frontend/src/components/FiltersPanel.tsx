import { BatchUpdateDialog } from '@/components/BatchUpdateDialog.tsx'
import { updateMultipleCards } from '@/components/Card.tsx'
import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { allCards } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { Card, CollectionRow, Rarity } from '@/types'
import { type FC, type JSX, useContext, useEffect, useMemo, useState } from 'react'

interface Props {
  children?: JSX.Element
  onFiltersChanged: (cards: Card[] | null) => void
  cards: CollectionRow[] | null

  visibleFilters?: {
    expansions?: boolean
    search?: boolean
    owned?: boolean
    rarity?: boolean
  }

  filtersDialog?: {
    expansions?: boolean
    search?: boolean
    owned?: boolean
    rarity?: boolean
  }

  batchUpdate?: boolean
}

const FilterPanel: FC<Props> = ({ children, cards, onFiltersChanged, visibleFilters, filtersDialog, batchUpdate }) => {
  const { user } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) return true
    return c.rarity !== 'Unknown' && c.rarity !== '' && rarityFilter.includes(c.rarity)
  }

  const getFilteredCards = useMemo(() => {
    if (!cards) {
      return null // cards are still loading
    }

    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => cards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !cards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }
    filteredCards = filteredCards.filter(filterRarities)
    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return card.name.toLowerCase().includes(searchValue.toLowerCase()) || card.card_id.toLowerCase().includes(searchValue.toLowerCase())
      })
    }

    for (const card of filteredCards) {
      if (!card.linkedCardID) {
        card.amount_owned = cards.find((oc) => oc.card_id === card.card_id)?.amount_owned || 0
      } else {
        card.amount_owned = 0
      }
    }

    return filteredCards
  }, [cards, expansionFilter, rarityFilter, searchValue, ownedFilter])

  useEffect(() => {
    onFiltersChanged(getFilteredCards)
  }, [getFilteredCards])

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div id="filterbar" className="flex flex-col gap-x-2 flex-wrap">
      {children}

      <div className="flex items-center gap-2 flex-col md:flex-row gap-y-1 px-4 mb-2">
        {visibleFilters?.expansions && <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />}
      </div>
      <div className="items-center gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput setSearchValue={setSearchValue} />}
        {visibleFilters?.owned && <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />}
        {visibleFilters?.rarity && <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} collapse />}

        {filtersDialog && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">All filters</Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-slate-600 shadow-none">
              <DialogHeader>
                <DialogTitle>Filters ({(getFilteredCards || []).filter((c) => !c.linkedCardID).length})</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput setSearchValue={setSearchValue} fullWidth />}
                {filtersDialog.expansions && <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />}
                {filtersDialog.rarity && <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />}
                {filtersDialog.owned && <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} fullWidth />}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {batchUpdate && (
          <BatchUpdateDialog
            filteredCards={getFilteredCards || []}
            onBatchUpdate={handleBatchUpdate}
            disabled={!getFilteredCards || getFilteredCards.length === 0}
          />
        )}
      </div>
    </div>
  )
}

export default FilterPanel
