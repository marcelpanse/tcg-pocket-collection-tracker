import i18n from 'i18next'
import { type Dispatch, type FC, type JSX, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BatchUpdateDialog } from '@/components/BatchUpdateDialog.tsx'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import OwnedFilter from '@/components/filters/OwnedFilter.tsx'
import PackFilter from '@/components/filters/PackFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { allCards, basicRarities, expansions, expansionsDict } from '@/lib/CardsDB.ts'
import { levenshtein } from '@/lib/levenshtein'
import { getCardNameByLang } from '@/lib/utils'
import { useProfileDialog } from '@/services/account/useAccount'
import type { Card, CardType, CollectionRow, Mission, Rarity } from '@/types'
import AllTextSearchFilter from './filters/AllTextSearchFilter'
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
  sortBy: 'default' | 'recent' | 'expansion-newest'
  minNumber: number
  maxNumber: number
  deckbuildingMode: boolean
  allTextSearch: boolean
}

interface Props {
  children?: JSX.Element

  cards: CollectionRow[] | null

  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>

  onFiltersChanged: (cards: Card[] | null) => void
  onChangeToMissions: (missions: Mission[] | null) => void

  visibleFilters?: {
    expansions?: boolean
    search?: boolean
    allTextSearch?: boolean
    owned?: boolean
    rarity?: boolean
  }

  filtersDialog?: {
    expansions?: boolean
    pack?: boolean
    search?: boolean
    allTextSearch?: boolean
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
  const { setIsProfileDialogOpen } = useProfileDialog()

  const setFilterChange = (filters: Filters) => {
    const cards = getFilteredCards(filters)
    onFiltersChanged(cards)
    setFilters(filters)
  }

  const setSearchValue = (x: string) => setFilterChange({ ...filters, search: x })
  const setAllTextSearch = (x: boolean) => setFilterChange({ ...filters, allTextSearch: x })
  const setPack = (x: string) => setFilterChange({ ...filters, pack: x })
  const setCardType = (x: CardType[]) => setFilterChange({ ...filters, cardType: x })
  const setRarity = (x: Rarity[]) => setFilterChange({ ...filters, rarity: x })
  const setOwned = (x: 'all' | 'owned' | 'missing') => setFilterChange({ ...filters, owned: x })
  const setSortBy = (x: 'default' | 'recent' | 'expansion-newest') => setFilterChange({ ...filters, sortBy: x })
  const setMinNumber = (x: number) => setFilterChange({ ...filters, minNumber: x })
  const setMaxNumber = (x: number) => setFilterChange({ ...filters, maxNumber: x })
  const setDeckbuildingMode = (x: boolean) => setFilterChange({ ...filters, deckbuildingMode: x })
  const [missions, setMissions] = useState<Mission[] | null>(null)

  const getFilteredCards = (filters: Filters) => {
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
      setMissions(missions)
    } else {
      setMissions(null)
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
    } else if (filters.sortBy === 'expansion-newest') {
      const reversedExpansions = [...expansions]
        .reverse()
        .slice(1)
        .concat(expansions[expansions.length - 1])
      filteredCards = [...filteredCards].sort((a: Card, b: Card) => {
        const expansionIndexA = reversedExpansions.findIndex((e) => e.id === a.expansion)
        const expansionIndexB = reversedExpansions.findIndex((e) => e.id === b.expansion)

        if (expansionIndexA !== expansionIndexB) {
          return expansionIndexA - expansionIndexB
        }

        return a.card_id.localeCompare(b.card_id, i18n.language || 'en', { numeric: true })
      })
    }

    filteredCards = filteredCards.filter((c: Card) => {
      if (filters.rarity.length === 0) {
        return true
      }
      return c.rarity !== '' && filters.rarity.includes(c.rarity)
    })
    filteredCards = filteredCards.filter((c: Card) => {
      if (filters.cardType.length === 0) {
        return true
      }
      if (c.card_type.toLowerCase() === 'trainer') {
        return filters.cardType.includes('trainer')
      }
      return c.energy !== '' && filters.cardType.includes(c.energy.toLowerCase() as CardType)
    })

    if (filters.search) {
      const threshold = 2 // tweak if needed

      filteredCards = filteredCards.filter((card) => {
        const name = getCardNameByLang(card, i18n.language).toLowerCase()
        const query = filters.search.toLowerCase()

        let filterAllText = false
        if (filters.allTextSearch) {
          const cardAbilityName = card.ability.name?.toLowerCase()
          const cardAbilityEffect = card.ability.effect?.toLowerCase()

          filterAllText =
            (cardAbilityName && cardAbilityName !== 'no ability' && (cardAbilityName.includes(query) || cardAbilityEffect.includes(query))) ||
            card.attacks.some(
              (attack) =>
                attack.name?.toLowerCase().includes(query) || (attack.effect?.toLowerCase() !== 'no effect' && attack.effect?.toLowerCase()?.includes(query)),
            )
        }
        const isExactMatch = name.includes(query)
        const isFuzzyMatch = levenshtein(name, query) <= threshold
        const isIdMatch = card.card_id.toLowerCase().includes(query)

        return filterAllText || isExactMatch || isFuzzyMatch || isIdMatch
      })
    }

    const amounts = new Map((cards || []).map((x) => [x.card_id, x.amount_owned]))

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
  }

  const filteredCards = useMemo(() => getFilteredCards(filters), [filters])

  useEffect(() => {
    onFiltersChanged(filteredCards)
  }, [])

  useEffect(() => {
    onChangeToMissions(missions)
  }, [missions])

  function onExpansionChange(x: string) {
    setFilterChange({ ...filters, expansion: x, pack: 'all' })
  }

  return (
    <div id="filterbar" className="flex flex-col gap-x-2 flex-wrap">
      {children}

      {visibleFilters?.expansions && (
        <div className="flex gap-x-2 px-4 mb-2">
          <ExpansionsFilter value={filters.expansion} onChange={onExpansionChange} />
          <PackFilter className="w-[440px]" value={filters.pack} onChange={setPack} expansion={filters.expansion} />
        </div>
      )}
      <div className="gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput className="w-full sm:w-32" setSearchValue={setSearchValue} />}
        {visibleFilters?.owned && <OwnedFilter ownedFilter={filters.owned} setOwnedFilter={setOwned} />}
        {visibleFilters?.rarity && (
          <RarityFilter rarityFilter={filters.rarity} setRarityFilter={setRarity} deckbuildingMode={filters.deckbuildingMode} collapse />
        )}

        {filtersDialog && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{t('filters.allFilters')}</Button>
            </DialogTrigger>
            <DialogContent className="border-1 border-neutral-700 shadow-none max-h-[90vh] overflow-y-auto content-start">
              <DialogHeader>
                <DialogTitle>{t('filters.filtersCount', { count: (filteredCards || []).filter((c) => !c.linkedCardID).length })}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput className="w-full" setSearchValue={setSearchValue} />}
                {filtersDialog.allTextSearch && <AllTextSearchFilter allTextSearch={filters.allTextSearch} setAllTextSearch={setAllTextSearch} />}
                {filtersDialog.expansions && <ExpansionsFilter value={filters.expansion} onChange={onExpansionChange} />}
                {filtersDialog.pack && <PackFilter className="w-full" value={filters.pack} onChange={setPack} expansion={filters.expansion} />}
                {filtersDialog.rarity && <RarityFilter rarityFilter={filters.rarity} setRarityFilter={setRarity} deckbuildingMode={filters.deckbuildingMode} />}
                {filtersDialog.cardType && <CardTypeFilter cardTypeFilter={filters.cardType} setCardTypeFilter={setCardType} />}
                {filtersDialog.owned && <OwnedFilter className="w-full" ownedFilter={filters.owned} setOwnedFilter={setOwned} />}
                {filtersDialog.sortBy && <SortByRecent sortBy={filters.sortBy} setSortBy={setSortBy} />}
                {filtersDialog.amount && (
                  <>
                    <NumberFilter numberFilter={filters.minNumber} setNumberFilter={setMinNumber} options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} labelKey="minNum" />
                    <NumberFilter
                      numberFilter={filters.maxNumber}
                      setNumberFilter={setMaxNumber}
                      options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
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
                      sortBy: 'expansion-newest',
                      minNumber: 0,
                      maxNumber: 100,
                      deckbuildingMode: false,
                      allTextSearch: false,
                    })
                  }
                >
                  {t('filters.clear')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {batchUpdate && <BatchUpdateDialog filteredCards={filteredCards || []} disabled={!filteredCards || filteredCards.length === 0} />}

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
