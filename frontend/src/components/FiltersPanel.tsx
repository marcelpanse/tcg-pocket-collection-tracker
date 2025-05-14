import { BatchUpdateDialog } from '@/components/BatchUpdateDialog.tsx'
import { updateMultipleCards } from '@/components/Card.tsx'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import OwnedFilter from '@/components/filters/OwnedFilter.tsx'
import PackFilter from '@/components/filters/PackFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { allCards } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { getCardNameByLang } from '@/lib/utils'
import type { Card, CollectionRow, Rarity } from '@/types'
import i18n from 'i18next'
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
    pack?: boolean
    search?: boolean
    owned?: boolean
    rarity?: boolean
    amount?: boolean
  }

  batchUpdate?: boolean
  share?: boolean
}

const FilterPanel: FC<Props> = ({ children, cards, onFiltersChanged, visibleFilters, filtersDialog, batchUpdate, share }: Props) => {
  const { user, setIsProfileDialogOpen } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  const [langState, setLangState] = useState(i18n.language)
  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [packFilter, setPackFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [numberFilter, setNumberFilter] = useState(0)
  const [maxNumberFilter, setMaxNumberFilter] = useState(100)

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
    if (packFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.pack === packFilter || card.pack === 'everypack')
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }
    filteredCards = filteredCards.filter(filterRarities)

    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return (
          getCardNameByLang(card, i18n.language).toLowerCase().includes(searchValue.toLowerCase()) ||
          card.card_id.toLowerCase().includes(searchValue.toLowerCase())
        )
      })
    }

    for (const card of filteredCards) {
      if (!card.linkedCardID) {
        card.amount_owned = cards.find((oc: CollectionRow) => oc.card_id === card.card_id)?.amount_owned || 0
      } else {
        card.amount_owned = 0
      }
    }
    filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) >= numberFilter)
    if (maxNumberFilter !== 100) {
      filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) <= maxNumberFilter)
    }

    return filteredCards
  }, [cards, expansionFilter, packFilter, rarityFilter, searchValue, ownedFilter, numberFilter, maxNumberFilter, langState])

  useEffect(() => {
    onFiltersChanged(getFilteredCards)
    const handleLanguageChange = (lng: string) => {
      setLangState(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [getFilteredCards])

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div id="filterbar" className="flex flex-col gap-x-2 flex-wrap">
      {children}

      <div className="flex items-center gap-2 flex-col md:flex-row gap-y-1 px-4 mb-2">
        {visibleFilters?.expansions && (
          <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} setPackFilter={setPackFilter} />
        )}
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
            <DialogContent className="border-1 border-neutral-700 shadow-none">
              <DialogHeader>
                <DialogTitle>Filters ({(getFilteredCards || []).filter((c) => !c.linkedCardID).length})</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput setSearchValue={setSearchValue} fullWidth />}
                {filtersDialog.expansions && (
                  <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} setPackFilter={setPackFilter} />
                )}
                {filtersDialog.pack && <PackFilter packFilter={packFilter} setPackFilter={setPackFilter} expansion={expansionFilter} />}
                {filtersDialog.rarity && <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />}
                {filtersDialog.owned && <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} fullWidth />}
                {filtersDialog.amount && (
                  <>
                    <NumberFilter numberFilter={numberFilter} setNumberFilter={setNumberFilter} options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} labelKey="minNum" />
                    <NumberFilter
                      numberFilter={maxNumberFilter}
                      setNumberFilter={setMaxNumberFilter}
                      options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      labelKey="maxNum"
                    />
                  </>
                )}
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

        {share && (
          <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}>
            Share
          </Button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
