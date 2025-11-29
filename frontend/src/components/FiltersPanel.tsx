import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { getExpansionById } from '@/lib/CardsDB.ts'
import { cardTypeOptions, type ExpansionOption, expansionOptions, type Filters, ownedOptions, sortByOptions } from '@/lib/filters'
import { DropdownFilter, TabsFilter, ToggleFilter } from './Filters'
import AllTextSearchFilter from './filters/AllTextSearchFilter'
import DeckbuildingFilter from './filters/DeckbuildingFilter'
import { showCardType } from './utils'

interface Props {
  className?: string
  filters: Filters
  setFilters: (updates: Partial<Filters>) => void
  clearFilters: () => void
}

const FilterPanel: FC<Props> = ({ className, filters, setFilters, clearFilters }: Props) => {
  const { t } = useTranslation(['pages/collection', 'common/sets', 'common/packs', 'filters'])

  const changeFilter = (k: keyof Filters) => (x: Filters[typeof k]) => setFilters({ [k]: x })

  const packsToShow = useMemo(() => {
    if (filters.expansion === undefined || filters.expansion === 'all') {
      return undefined
    } else {
      return [
        'all',
        ...getExpansionById(filters.expansion)
          .packs.map((pack) => pack.name)
          .filter((pack) => pack !== 'everypack'),
      ]
    }
  }, [filters.expansion])

  function onExpansionChange(x: ExpansionOption) {
    if (filters.pack === undefined) {
      setFilters({ expansion: x })
    } else {
      setFilters({ expansion: x, pack: 'all' })
    }
  }

  function getLocalizedExpansion(id: ExpansionOption) {
    return t(id === 'all' ? 'all' : getExpansionById(id).name, { ns: 'common/sets' })
  }

  return (
    <div className={className}>
      {filters.search !== undefined && <SearchInput value={filters.search} setValue={changeFilter('search')} />}
      {filters.allTextSearch !== undefined && <AllTextSearchFilter allTextSearch={filters.allTextSearch} setAllTextSearch={changeFilter('allTextSearch')} />}
      {filters.expansion !== undefined && (
        <DropdownFilter
          label={t('expansion', { ns: 'common/sets' })}
          options={expansionOptions}
          value={filters.expansion}
          onChange={onExpansionChange}
          show={getLocalizedExpansion}
        />
      )}
      {filters.pack !== undefined && packsToShow && (
        <TabsFilter className="block" options={packsToShow} value={filters.pack} onChange={changeFilter('pack')} show={(x) => t(x, { ns: 'common/packs' })} />
      )}
      {filters.rarity !== undefined && (
        <RarityFilter rarityFilter={filters.rarity} setRarityFilter={changeFilter('rarity')} deckbuildingMode={filters.deckbuildingMode} />
      )}
      {filters.cardType !== undefined && (
        <ToggleFilter options={cardTypeOptions} value={filters.cardType} onChange={changeFilter('cardType')} show={showCardType} />
      )}
      {filters.owned !== undefined && (
        <TabsFilter
          className="block"
          options={ownedOptions}
          value={filters.owned}
          onChange={changeFilter('owned')}
          show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })}
        />
      )}
      {filters.sortBy !== undefined && (
        <DropdownFilter
          label={t('f-sortBy.sortBy', { ns: 'filters' })}
          options={sortByOptions}
          value={filters.sortBy}
          onChange={changeFilter('sortBy')}
          show={(x) => t(`f-sortBy.${x}`, { ns: 'filters' })}
        />
      )}
      {filters.minNumber !== undefined && (
        <DropdownFilter
          label={t('f-number.minNum', { ns: 'filters' })}
          options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
          value={filters.minNumber}
          onChange={changeFilter('minNumber')}
        />
      )}
      {filters.maxNumber !== undefined && (
        <DropdownFilter
          label={t('f-number.maxNum', { ns: 'filters' })}
          options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
          value={filters.maxNumber}
          onChange={changeFilter('maxNumber')}
        />
      )}
      {filters.deckbuildingMode !== undefined && (
        <DeckbuildingFilter deckbuildingMode={filters.deckbuildingMode} setDeckbuildingMode={changeFilter('deckbuildingMode')} />
      )}
      <Button variant="outline" className="!text-red-700" onClick={clearFilters}>
        {t('filters.clear')}
      </Button>
    </div>
  )
}

export default FilterPanel
