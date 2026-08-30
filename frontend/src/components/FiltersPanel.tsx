import { Slot } from '@radix-ui/react-slot'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { getExpansionById } from '@/lib/CardsDB.ts'
import {
  abilityOptions,
  cardTypeOptions,
  type ExpansionOption,
  expansionOptions,
  type Filters,
  hpOptions,
  ownershipOptions,
  pokemonKindOptions,
  retreatOptions,
  sortByOptions,
  stageOptions,
  tradingOptions,
  trainerSubtypeOptions,
} from '@/lib/filters'
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

  const getPacksToShow = () => {
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
  }
  const packsToShow = getPacksToShow()

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
        <TabsFilter options={packsToShow} value={filters.pack} onChange={changeFilter('pack')} show={(x) => t(x, { ns: 'common/packs' })} />
      )}
      {filters.rarity !== undefined && (
        <RarityFilter rarityFilter={filters.rarity} setRarityFilter={changeFilter('rarity')} deckbuildingMode={filters.deckbuildingMode} />
      )}
      {(filters.cardType !== undefined || filters.trainerSubtype !== undefined) && (
        <div className="flex flex-col gap-1">
          {filters.cardType !== undefined && (
            <ToggleFilter
              options={cardTypeOptions}
              value={filters.cardType}
              onChange={changeFilter('cardType')}
              show={showCardType}
              label={t('f-type.pokemon', { ns: 'filters' })}
              selectAllLabel={t('f-selectAll', { ns: 'filters' })}
              clearAllLabel={t('f-clearAll', { ns: 'filters' })}
            />
          )}
          {filters.trainerSubtype !== undefined && (
            <ToggleFilter
              options={trainerSubtypeOptions}
              value={filters.trainerSubtype}
              onChange={changeFilter('trainerSubtype')}
              show={(x) => t(`f-trainerSubtype.${x}`, { ns: 'filters' })}
              label={t('f-type.trainer', { ns: 'filters' })}
              selectAllLabel={t('f-selectAll', { ns: 'filters' })}
              clearAllLabel={t('f-clearAll', { ns: 'filters' })}
            />
          )}
        </div>
      )}
      {filters.stage !== undefined && (
        <ToggleFilter
          options={stageOptions}
          value={filters.stage}
          onChange={changeFilter('stage')}
          show={(x) => t(`f-stage.${x}`, { ns: 'filters' })}
          label={t('f-stage.label', { ns: 'filters' })}
        />
      )}
      {filters.pokemonKind !== undefined && (
        <ToggleFilter
          options={pokemonKindOptions}
          value={filters.pokemonKind}
          onChange={changeFilter('pokemonKind')}
          show={(x) => t(`f-pokemonKind.${x}`, { ns: 'filters' })}
          label={t('f-pokemonKind.label', { ns: 'filters' })}
        />
      )}
      {filters.ability !== undefined && (
        <TabsFilter
          options={abilityOptions}
          value={filters.ability}
          onChange={changeFilter('ability')}
          label={t('f-ability.label', { ns: 'filters' })}
          show={(x) => t(`f-ability.${x}`, { ns: 'filters' })}
        />
      )}
      {(filters.minHp !== undefined || filters.maxHp !== undefined) && (
        <div className="flex gap-2">
          {filters.minHp !== undefined && (
            <DropdownFilter
              className="flex-1"
              label={t('f-hp.minHp', { ns: 'filters' })}
              options={hpOptions}
              value={filters.minHp}
              onChange={changeFilter('minHp')}
            />
          )}
          {filters.maxHp !== undefined && (
            <DropdownFilter
              className="flex-1"
              label={t('f-hp.maxHp', { ns: 'filters' })}
              options={['∞', ...hpOptions]}
              value={filters.maxHp}
              onChange={changeFilter('maxHp')}
            />
          )}
        </div>
      )}
      {(filters.minRetreat !== undefined || filters.maxRetreat !== undefined) && (
        <div className="flex gap-2">
          {filters.minRetreat !== undefined && (
            <DropdownFilter
              className="flex-1"
              label={t('f-retreat.minRetreat', { ns: 'filters' })}
              options={retreatOptions}
              value={filters.minRetreat}
              onChange={changeFilter('minRetreat')}
            />
          )}
          {filters.maxRetreat !== undefined && (
            <DropdownFilter
              className="flex-1"
              label={t('f-retreat.maxRetreat', { ns: 'filters' })}
              options={['∞', ...retreatOptions]}
              value={filters.maxRetreat}
              onChange={changeFilter('maxRetreat')}
            />
          )}
        </div>
      )}
      {filters.ownership !== undefined && (
        <TabsFilter
          options={ownershipOptions}
          value={filters.ownership}
          onChange={changeFilter('ownership')}
          label={t('carddex', { ns: 'filters' })}
          show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-ownership' })}
        />
      )}
      {filters.trading !== undefined && (
        <TabsFilter
          options={tradingOptions}
          value={filters.trading}
          onChange={changeFilter('trading')}
          label={t('trading', { ns: 'filters' })}
          show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-trading' })}
        />
      )}
      {filters.sortBy !== undefined && (
        <div className="flex gap-2">
          <DropdownFilter
            className="flex-1"
            label={t('f-sortBy.sortBy', { ns: 'filters' })}
            options={sortByOptions}
            value={filters.sortBy}
            onChange={changeFilter('sortBy')}
            show={(x) => t(`f-sortBy.${x}`, { ns: 'filters' })}
          />
          {filters.sortDesc !== undefined && (
            <button
              type="button"
              onClick={() => setFilters({ sortDesc: !filters.sortDesc })}
              className="group h-auto aspect-square bg-neutral-800 hover:bg-neutral-600 rounded-md border border-neutral-700 flex items-center justify-center"
            >
              <Slot className="stroke-neutral-400 group-hover:stroke-neutral-300">{filters.sortDesc ? <ArrowUpAZ /> : <ArrowDownAZ />}</Slot>
            </button>
          )}
        </div>
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
          options={['∞', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
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
