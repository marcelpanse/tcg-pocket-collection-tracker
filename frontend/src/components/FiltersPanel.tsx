import i18n from 'i18next'
import { type Dispatch, type FC, type SetStateAction, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { BatchUpdateDialog } from '@/components/BatchUpdateDialog.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { allCards, basicRarities, expansions, getExpansionById } from '@/lib/CardsDB.ts'
import { levenshtein } from '@/lib/levenshtein'
import { getCardNameByLang } from '@/lib/utils'
import { useProfileDialog } from '@/services/account/useAccount'
import { type Card, type CollectionRow, cardTypes, expansionIds, type Rarity } from '@/types'
import { DropdownFilter, TabsFilter, ToggleFilter } from './Filters'
import AllTextSearchFilter from './filters/AllTextSearchFilter'
import DeckbuildingFilter from './filters/DeckbuildingFilter'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const ownedOptions = ['all', 'missing', 'owned'] as const
const expansionOptions = ['all', ...expansionIds] as const
const sortByOptions = ['default', 'recent', 'expansion-newest'] as const
const cardTypeOptions = [...cardTypes.filter((x) => x !== '')] as const
type OwnedOption = (typeof ownedOptions)[number]
type ExpansionOption = (typeof expansionOptions)[number]
type SortByOption = (typeof sortByOptions)[number]
type CardTypeOption = (typeof cardTypeOptions)[number]

export interface Filters {
  search: string
  expansion: ExpansionOption
  pack: string
  cardType: CardTypeOption[]
  rarity: Rarity[]
  owned: OwnedOption
  sortBy: SortByOption
  minNumber: number
  maxNumber: number
  deckbuildingMode: boolean
  allTextSearch: boolean
}

interface Props {
  cards: CollectionRow[] | null

  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>

  onFiltersChanged: (cards: Card[] | null) => void

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
  missionsButton?: boolean
}

const FilterPanel: FC<Props> = ({ cards, filters, setFilters, onFiltersChanged, visibleFilters, filtersDialog, batchUpdate, share, missionsButton }: Props) => {
  const { t } = useTranslation(['pages/collection', 'common/sets', 'common/packs', 'filters'])
  const navigate = useNavigate()
  const { setIsProfileDialogOpen } = useProfileDialog()

  const setFilterChange = (filters: Partial<Filters>) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, ...filters }
      const cards = getFilteredCards(newFilters)
      onFiltersChanged(cards)
      return newFilters
    })
  }

  const setSearchValue = (x: string) => setFilterChange({ search: x })
  const setAllTextSearch = (x: boolean) => setFilterChange({ allTextSearch: x })
  const setPack = (x: string) => setFilterChange({ pack: x })
  const setRarity = (x: Rarity[]) => setFilterChange({ rarity: x })
  const setOwned = (x: OwnedOption) => setFilterChange({ owned: x })

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
    if (filters.pack !== 'all') {
      filteredCards = filteredCards.filter((card) => card.pack === filters.pack || card.pack === 'everypack')
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
      return c.energy !== '' && filters.cardType.includes(c.energy.toLowerCase() as CardTypeOption)
    })

    if (filters.search) {
      const threshold = 2 // tweak if needed

      filteredCards = filteredCards.filter((card) => {
        const name = getCardNameByLang(card, i18n.language).toLowerCase()
        const query = filters.search.toLowerCase()

        let filterAllText = false
        if (filters.allTextSearch) {
          filterAllText =
            (card.ability && (card.ability.name.toLowerCase().includes(query) || card.ability.effect.toLowerCase().includes(query))) ||
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
          card.amount_owned = card.alternate_versions.reduce((acc, c) => acc + (amounts.get(c) ?? 0), 0)
        } else {
          card.amount_owned = amounts.get(card.card_id) ?? 0
        }
      } else {
        card.amount_owned = 0
      }
    }
    filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) >= filters.minNumber)
    if (filters.maxNumber !== 100) {
      filteredCards = filteredCards.filter((f) => (f.amount_owned ?? 0) <= filters.maxNumber)
    }

    return filteredCards
  }

  const filteredCards = useMemo(() => getFilteredCards(filters), [filters, cards])

  const packsToShow = useMemo(() => {
    const expansion = getExpansionById(filters.expansion)
    if (!expansion || expansion.packs.length <= 1) {
      return undefined
    } else {
      return ['all', ...expansion.packs.map((pack) => pack.name).filter((pack) => pack !== 'everypack')]
    }
  }, [filters.expansion])

  useEffect(() => {
    onFiltersChanged(filteredCards)
  }, [])

  function onExpansionChange(x: ExpansionOption) {
    setFilterChange({ expansion: x, pack: 'all' })
  }
  const getLocalizedExpansion = (id: ExpansionOption) => {
    const expansion_name = id === 'all' ? 'all' : (getExpansionById(id)?.name ?? 'unknown')
    return t(expansion_name, { ns: 'common/sets' })
  }

  function showCardType(x: CardTypeOption) {
    if (x === 'trainer') {
      return 'T'
    } else {
      return <img src={`/images/energy/${x}.webp`} alt={x} className="h-4" />
    }
  }

  return (
    <div id="filterbar" className="flex flex-col gap-x-2 flex-wrap">
      {visibleFilters?.expansions && (
        <div className="flex gap-x-2 px-4 mb-2">
          <DropdownFilter
            label={t('expansion', { ns: 'common/sets' })}
            options={expansionOptions}
            value={filters.expansion}
            onChange={onExpansionChange}
            show={getLocalizedExpansion}
          />
          {packsToShow && <TabsFilter options={packsToShow} value={filters.pack} onChange={setPack} show={(x) => t(x, { ns: 'common/packs' })} />}
        </div>
      )}
      <div className="gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput className="w-full sm:w-32" setSearchValue={setSearchValue} />}
        {visibleFilters?.owned && (
          <TabsFilter options={ownedOptions} value={filters.owned} onChange={setOwned} show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })} />
        )}
        {visibleFilters?.rarity && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {t('rarity', { ns: 'filters' })} ({filters.rarity.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-28">
              <RarityFilter
                className="flex-col bg-transparent"
                rarityFilter={filters.rarity}
                setRarityFilter={setRarity}
                deckbuildingMode={filters.deckbuildingMode}
              />
            </PopoverContent>
          </Popover>
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
                {filtersDialog.search && <SearchInput className="w-full bg-neutral-900" setSearchValue={setSearchValue} />}
                {filtersDialog.allTextSearch && <AllTextSearchFilter allTextSearch={filters.allTextSearch} setAllTextSearch={setAllTextSearch} />}
                {filtersDialog.expansions && (
                  <DropdownFilter
                    className="bg-neutral-900"
                    label={t('expansion', { ns: 'common/sets' })}
                    options={expansionOptions}
                    value={filters.expansion}
                    onChange={onExpansionChange}
                    show={getLocalizedExpansion}
                  />
                )}
                {filtersDialog.pack && packsToShow && (
                  <TabsFilter
                    className="w-full bg-neutral-900"
                    options={packsToShow}
                    value={filters.pack}
                    onChange={setPack}
                    show={(x) => t(x, { ns: 'common/packs' })}
                  />
                )}
                {filtersDialog.rarity && (
                  <RarityFilter
                    className="bg-neutral-900"
                    rarityFilter={filters.rarity}
                    setRarityFilter={setRarity}
                    deckbuildingMode={filters.deckbuildingMode}
                  />
                )}
                {filtersDialog.cardType && (
                  <ToggleFilter
                    className="bg-neutral-900"
                    options={cardTypeOptions}
                    value={filters.cardType}
                    onChange={(x) => setFilterChange({ cardType: x })}
                    show={showCardType}
                  />
                )}
                {filtersDialog.owned && (
                  <TabsFilter
                    className="w-full bg-neutral-900"
                    options={ownedOptions}
                    value={filters.owned}
                    onChange={setOwned}
                    show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })}
                  />
                )}
                {filtersDialog.sortBy && (
                  <DropdownFilter
                    className="bg-neutral-900"
                    label={t('f-sortBy.sortBy', { ns: 'filters' })}
                    options={sortByOptions}
                    value={filters.sortBy}
                    onChange={(x) => setFilterChange({ sortBy: x })}
                    show={(x) => t(`f-sortBy.${x}`, { ns: 'filters' })}
                  />
                )}
                {filtersDialog.amount && (
                  <>
                    <DropdownFilter
                      className="bg-neutral-900"
                      label={t('f-number.minNum', { ns: 'filters' })}
                      options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      value={filters.minNumber}
                      onChange={(x) => setFilterChange({ minNumber: x })}
                    />
                    <DropdownFilter
                      className="bg-neutral-900"
                      label={t('f-number.maxNum', { ns: 'filters' })}
                      options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      value={filters.maxNumber}
                      onChange={(x) => setFilterChange({ maxNumber: x })}
                    />
                  </>
                )}
                {filtersDialog.deckBuildingMode && (
                  <DeckbuildingFilter deckbuildingMode={filters.deckbuildingMode} setDeckbuildingMode={(x) => setFilterChange({ deckbuildingMode: x })} />
                )}
                <Button
                  variant="outline"
                  className="!text-red-700"
                  onClick={() => {
                    const filters: Filters = {
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
                    }
                    const cards = getFilteredCards(filters)
                    onFiltersChanged(cards)
                    setFilters(filters)
                  }}
                >
                  {t('filters.clear')}
                </Button>
                {missionsButton && (
                  <Button className="mt-2" variant="outline" onClick={() => navigate('/collection/missions')}>
                    {t('goToMissions')}
                  </Button>
                )}
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
