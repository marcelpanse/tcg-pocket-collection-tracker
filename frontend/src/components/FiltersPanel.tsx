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
import { allCards, basicRarities, expansionsDict } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { levenshtein } from '@/lib/levenshtein'
import { getCardNameByLang } from '@/lib/utils'
import type { Card, CardType, CollectionRow, Mission, Rarity } from '@/types'
import i18n from 'i18next'
import { type FC, type JSX, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CardTypeFilter from './filters/CardTypeFilter'
import DeckbuildingFilter from './filters/DeckbuildingFilter'
import SortByRecent from './filters/SortByRecent'

export interface Filters {
  search: string
  expansion: string
  pack: string
  cardType: CardType[]
  rarity: Rarity[]
  owned: 'all' | 'owned' | 'missing'
  sortBy: 'default' | 'recent'
  minNumber: number
  maxNumber: number
  deckbuildingMode: boolean
}

interface Props {
  children?: JSX.Element

  cards: CollectionRow[] | null

  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>

  onFiltersChanged: (cards: Card[] | null) => void
  onChangeToMissions: (missions: Mission[] | null) => void

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
    cardType?: boolean
    rarity?: boolean
    amount?: boolean
    sortBy?: boolean
    deckBuildingMode?: boolean
  }

  batchUpdate?: boolean
  share?: boolean
}

const FilterPanel: FC<Props> = ({
  children,
  cards,
  filters,
  setFilters,
  onFiltersChanged,
  onChangeToMissions,
  visibleFilters,
  filtersDialog,
  batchUpdate,
  share,
}: Props) => {
  const { t } = useTranslation(['pages/collection'])
  const { user, setIsProfileDialogOpen } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  const [langState, setLangState] = useState(i18n.language)
  const setSearchValue = (x: string) => setFilters((f) => ({ ...f, search: x }))
  const setExpansion = (x: string) => setFilters((f) => ({ ...f, expansion: x }))
  const setPack = (x: string) => setFilters((f) => ({ ...f, pack: x }))
  const setCardType = (x: CardType[]) => setFilters((f) => ({ ...f, cardType: x }))
  const setRarity = (x: Rarity[]) => setFilters((f) => ({ ...f, rarity: x }))
  const setOwned = (x: 'all' | 'owned' | 'missing') => setFilters((f) => ({ ...f, owned: x }))
  const setSortBy = (x: 'default' | 'recent') => setFilters((f) => ({ ...f, sortBy: x }))
  const setMinNumber = (x: number) => setFilters((f) => ({ ...f, minNumber: x }))
  const setMaxNumber = (x: number) => setFilters((f) => ({ ...f, maxNumber: x }))
  const setDeckbuildingMode = (x: boolean) => setFilters((f) => ({ ...f, deckbuildingMode: x }))

  const filterRarities = (c: Card) => {
    if (filters.rarity.length === 0) return true
    return c.rarity !== '' && filters.rarity.includes(c.rarity)
  }

  const filterCardTypes = (c: Card) => {
    if (filters.cardType.length === 0) return true
    if (c.card_type.toLowerCase() === 'trainer') {
      return filters.cardType.includes('trainer')
    }
    return c.energy !== '' && filters.cardType.includes(c.energy.toLowerCase() as CardType)
  }

  const getFilteredCards = useMemo(() => {
    if (!cards) {
      return null // cards are still loading
    }

    let filteredCards = allCards

    if (filters.deckbuildingMode) {
      filteredCards = filteredCards.filter((c) => basicRarities.includes(c.rarity) || c.rarity === '' || c.rarity === 'P')
    }

    if (filters.expansion !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === filters.expansion)
    }
    if (filters.pack === 'missions') {
      filteredCards = []
      let missions = expansionsDict.get(filters.expansion)?.missions || null
      if (missions) {
        if (filters.owned === 'owned') {
          missions = missions.filter((mission) => mission.completed)
        } else if (filters.owned === 'missing') {
          missions = missions.filter((mission) => !mission.completed)
        }
      }
      onChangeToMissions(missions)
    } else {
      onChangeToMissions(null)
      if (filters.pack !== 'all') {
        filteredCards = filteredCards.filter((card) => card.pack === filters.pack || card.pack === 'everypack')
      }
    }
    if (filters.owned !== 'all') {
      if (filters.owned === 'owned') {
        filteredCards = filteredCards.filter((card) => cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (filters.owned === 'missing') {
        filteredCards = filteredCards.filter((card) => !cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }

    if (filters.sortBy === 'recent') {
      filteredCards = [...filteredCards].sort((a: Card, b: Card) => {
        const isUpdatedA = cards.find((oc: CollectionRow) => oc.card_id === a.card_id)?.updated_at
        const isUpdatedB = cards.find((oc: CollectionRow) => oc.card_id === b.card_id)?.updated_at
        if (isUpdatedA && isUpdatedB) {
          return new Date(isUpdatedB).getTime() - new Date(isUpdatedA).getTime()
        } else if (isUpdatedA && !isUpdatedB) {
          return -1
        } else {
          return 1
        }
      })
    }

    filteredCards = filteredCards.filter(filterRarities)
    filteredCards = filteredCards.filter(filterCardTypes)

    if (filters.search) {
      const threshold = 2 // tweak if needed

      filteredCards = filteredCards.filter((card) => {
        const name = getCardNameByLang(card, i18n.language).toLowerCase()
        const query = filters.search.toLowerCase()
        const isExactMatch = name.includes(query)
        const isFuzzyMatch = levenshtein(name, query) <= threshold
        const isIdMatch = card.card_id.toLowerCase().includes(query)

        return isExactMatch || isFuzzyMatch || isIdMatch
      })
    }

    const amounts = new Map(ownedCards.map((x) => [x.card_id, x.amount_owned]))

    for (const card of filteredCards) {
      if (!card.linkedCardID) {
        if (filters.deckbuildingMode) {
          card.amount_owned = card.alternate_versions.reduce((acc, c) => acc + (amounts.get(c.card_id) || 0), 0)
        } else {
          card.amount_owned = amounts.get(card.card_id) || 0
        }
      } else {
        card.amount_owned = 0
      }
    }
    filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) >= filters.minNumber)
    if (filters.maxNumber !== 100) {
      filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) <= filters.maxNumber)
    }

    return filteredCards
  }, [cards, filters, langState])

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
          <ExpansionsFilter expansionFilter={filters.expansion} setExpansionFilter={setExpansion} setPackFilter={setPack} packFilter={filters.pack} showPacks />
        )}
      </div>
      <div className="items-center gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput setSearchValue={setSearchValue} />}
        {visibleFilters?.owned && <OwnedFilter ownedFilter={filters.owned} setOwnedFilter={setOwned} />}
        {visibleFilters?.rarity && <RarityFilter rarityFilter={filters.rarity} setRarityFilter={setRarity} collapse />}

        {filtersDialog && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{t('filters.allFilters')}</Button>
            </DialogTrigger>
            <DialogContent className="border-1 border-neutral-700 shadow-none max-h-[90vh] overflow-y-auto content-start">
              <DialogHeader>
                <DialogTitle>{t('filters.filtersCount', { count: (getFilteredCards || []).filter((c) => !c.linkedCardID).length })}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput setSearchValue={setSearchValue} fullWidth />}
                {filtersDialog.expansions && (
                  <ExpansionsFilter expansionFilter={filters.expansion} setExpansionFilter={setExpansion} setPackFilter={setPack} packFilter={filters.pack} />
                )}
                {filtersDialog.pack && <PackFilter packFilter={filters.pack} setPackFilter={setPack} expansion={filters.expansion} fullWidth />}
                {filtersDialog.rarity && <RarityFilter rarityFilter={filters.rarity} setRarityFilter={setRarity} />}
                {filtersDialog.cardType && <CardTypeFilter cardTypeFilter={filters.cardType} setCardTypeFilter={setCardType} />}
                {filtersDialog.owned && <OwnedFilter ownedFilter={filters.owned} setOwnedFilter={setOwned} fullWidth />}
                {filtersDialog.sortBy && <SortByRecent sortBy={filters.sortBy} setSortBy={setSortBy} />}
                {filtersDialog.amount && (
                  <>
                    <NumberFilter numberFilter={filters.minNumber} setNumberFilter={setMinNumber} options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} labelKey="minNum" />
                    <NumberFilter
                      numberFilter={filters.maxNumber}
                      setNumberFilter={setMaxNumber}
                      options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      labelKey="maxNum"
                    />
                  </>
                )}
                {filtersDialog.deckBuildingMode && <DeckbuildingFilter deckbuildingMode={filters.deckbuildingMode} setDeckbuildingMode={setDeckbuildingMode} />}
                <Button
                  variant="outline"
                  className="!text-red-700"
                  onClick={() =>
                    setFilters({
                      search: '',
                      expansion: 'all',
                      pack: 'all',
                      cardType: [],
                      rarity: [],
                      owned: 'all',
                      sortBy: 'default',
                      minNumber: 0,
                      maxNumber: 100,
                      deckbuildingMode: false,
                    })
                  }
                >
                  {t('filters.clear')}
                </Button>
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
            {t('filters.share')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
