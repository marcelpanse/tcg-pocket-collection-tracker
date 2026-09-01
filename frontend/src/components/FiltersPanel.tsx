import { Slot } from '@radix-ui/react-slot'
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react'
import { type FC, useState } from 'react'
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
import { cn } from '@/lib/utils'
import { DropdownFilter, RangeFilter, TabsFilter, ToggleFilter } from './Filters'
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

  // Stage / Kind / Ability / HP / Retreat / copies owned are low-traffic, so they live behind a disclosure at the bottom.
  const advancedActive = [
    filters.stage !== undefined && filters.stage.length > 0,
    filters.pokemonKind !== undefined && filters.pokemonKind.length > 0,
    filters.ability !== undefined && filters.ability !== 'all',
    (filters.minHp !== undefined && filters.minHp > 0) || (filters.maxHp !== undefined && filters.maxHp !== '∞'),
    (filters.minRetreat !== undefined && filters.minRetreat > 0) || (filters.maxRetreat !== undefined && filters.maxRetreat !== '∞'),
    (filters.minNumber !== undefined && filters.minNumber > 0) || (filters.maxNumber !== undefined && filters.maxNumber !== '∞'),
  ]
  const activeAdvancedFilters = advancedActive.filter(Boolean).length
  const hasAdvancedFilters = [filters.stage, filters.pokemonKind, filters.ability, filters.minHp, filters.minRetreat, filters.minNumber].some(
    (x) => x !== undefined,
  )
  const [advancedOpen, setAdvancedOpen] = useState(activeAdvancedFilters > 0)

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
        <div className="flex flex-col gap-3">
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
      {filters.deckbuildingMode !== undefined && (
        <DeckbuildingFilter deckbuildingMode={filters.deckbuildingMode} setDeckbuildingMode={changeFilter('deckbuildingMode')} />
      )}
      {hasAdvancedFilters && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setAdvancedOpen((x) => !x)}
            className="group flex items-center gap-1.5 w-fit text-xs text-neutral-400 hover:text-neutral-300 cursor-pointer py-1"
          >
            <ChevronDown className={cn('size-3.5 transition-transform', !advancedOpen && '-rotate-90')} />
            {t('f-advanced.label', { ns: 'filters' })}
            {activeAdvancedFilters > 0 && (
              <span className="rounded-full bg-neutral-700 text-neutral-200 text-[10px] leading-none px-1.5 py-0.5">{activeAdvancedFilters}</span>
            )}
          </button>
          {advancedOpen && (
            <div className="flex flex-col gap-3">
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
              {filters.minHp !== undefined && filters.maxHp !== undefined && (
                <RangeFilter
                  label={t('f-hp.label', { ns: 'filters' })}
                  minOptions={hpOptions}
                  maxOptions={['∞', ...hpOptions]}
                  minValue={filters.minHp}
                  maxValue={filters.maxHp}
                  onMinChange={changeFilter('minHp')}
                  onMaxChange={changeFilter('maxHp')}
                />
              )}
              {filters.minRetreat !== undefined && filters.maxRetreat !== undefined && (
                <RangeFilter
                  label={t('f-retreat.label', { ns: 'filters' })}
                  minOptions={retreatOptions}
                  maxOptions={['∞', ...retreatOptions]}
                  minValue={filters.minRetreat}
                  maxValue={filters.maxRetreat}
                  onMinChange={changeFilter('minRetreat')}
                  onMaxChange={changeFilter('maxRetreat')}
                />
              )}
              {filters.minNumber !== undefined && filters.maxNumber !== undefined && (
                <RangeFilter
                  label={t('f-number.label', { ns: 'filters' })}
                  minOptions={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                  maxOptions={['∞', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  minValue={filters.minNumber}
                  maxValue={filters.maxNumber}
                  onMinChange={changeFilter('minNumber')}
                  onMaxChange={changeFilter('maxNumber')}
                />
              )}
            </div>
          )}
        </div>
      )}
      <Button variant="outline" className="!text-red-700" onClick={clearFilters}>
        {t('filters.clear')}
      </Button>
    </div>
  )
}

export default FilterPanel
