import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { useToast } from '@/hooks/use-toast'
import { getExpansionById } from '@/lib/CardsDB.ts'
import { type CardTypeOption, cardTypeOptions, type ExpansionOption, expansionOptions, type Filters, ownedOptions, sortByOptions } from '@/lib/filters'
import { useProfileDialog } from '@/services/account/useAccount'
import { DropdownFilter, TabsFilter, ToggleFilter } from './Filters'
import AllTextSearchFilter from './filters/AllTextSearchFilter'
import DeckbuildingFilter from './filters/DeckbuildingFilter'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface Props {
  filters: Filters
  setFilters: (updates: Partial<Filters>) => void
  clearFilters: () => void

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

  share?: boolean // undefined => disable, false => open settings, true => copy link
  missionsButton?: boolean
}

const FilterPanel: FC<Props> = ({ filters, setFilters, clearFilters, visibleFilters, filtersDialog, share, missionsButton }: Props) => {
  const { toast } = useToast()
  const { t } = useTranslation(['pages/collection', 'common/sets', 'common/packs', 'filters'])
  const { setIsProfileDialogOpen } = useProfileDialog()

  const changeFilter = (k: keyof Filters) => (x: Filters[typeof k]) => setFilters({ [k]: x })

  const packsToShow = useMemo(() => {
    if (filters.expansion === 'all') {
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
    setFilters({ expansion: x, pack: 'all' })
  }

  function getLocalizedExpansion(id: ExpansionOption) {
    return t(id === 'all' ? 'all' : getExpansionById(id).name, { ns: 'common/sets' })
  }

  function showCardType(x: CardTypeOption) {
    if (x === 'trainer') {
      return 'T'
    } else {
      return <img src={`/images/energy/${x}.webp`} alt={x} className="h-4" />
    }
  }

  async function onShare() {
    if (!share) {
      setIsProfileDialogOpen(true)
    } else {
      // @ts-expect-error: Experimental api https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/mobile
      if (navigator.share && (navigator.userAgentData?.mobile || /Mobi|Android/i.test(navigator.userAgent))) {
        await navigator.share({ title: 'My Pokemon TCG Pocket collection', url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: 'Copied to clipboard', variant: 'default' })
      }
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
          {packsToShow && <TabsFilter options={packsToShow} value={filters.pack} onChange={changeFilter('pack')} show={(x) => t(x, { ns: 'common/packs' })} />}
        </div>
      )}
      <div className="gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput className="w-full sm:w-32" setSearchValue={changeFilter('search')} />}
        {visibleFilters?.owned && (
          <TabsFilter
            options={ownedOptions}
            value={filters.owned}
            onChange={changeFilter('owned')}
            show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })}
          />
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
                setRarityFilter={changeFilter('rarity')}
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
                <DialogTitle>{t('filters.filtersCount')}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput className="w-full bg-neutral-900" setSearchValue={changeFilter('search')} />}
                {filtersDialog.allTextSearch && <AllTextSearchFilter allTextSearch={filters.allTextSearch} setAllTextSearch={changeFilter('allTextSearch')} />}
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
                    onChange={changeFilter('pack')}
                    show={(x) => t(x, { ns: 'common/packs' })}
                  />
                )}
                {filtersDialog.rarity && (
                  <RarityFilter
                    className="bg-neutral-900"
                    rarityFilter={filters.rarity}
                    setRarityFilter={changeFilter('rarity')}
                    deckbuildingMode={filters.deckbuildingMode}
                  />
                )}
                {filtersDialog.cardType && (
                  <ToggleFilter
                    className="bg-neutral-900"
                    options={cardTypeOptions}
                    value={filters.cardType}
                    onChange={changeFilter('cardType')}
                    show={showCardType}
                  />
                )}
                {filtersDialog.owned && (
                  <TabsFilter
                    className="w-full bg-neutral-900"
                    options={ownedOptions}
                    value={filters.owned}
                    onChange={changeFilter('owned')}
                    show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })}
                  />
                )}
                {filtersDialog.sortBy && (
                  <DropdownFilter
                    className="bg-neutral-900"
                    label={t('f-sortBy.sortBy', { ns: 'filters' })}
                    options={sortByOptions}
                    value={filters.sortBy}
                    onChange={changeFilter('sortBy')}
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
                      onChange={changeFilter('minNumber')}
                    />
                    <DropdownFilter
                      className="bg-neutral-900"
                      label={t('f-number.maxNum', { ns: 'filters' })}
                      options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      value={filters.maxNumber}
                      onChange={changeFilter('maxNumber')}
                    />
                  </>
                )}
                {filtersDialog.deckBuildingMode && (
                  <DeckbuildingFilter deckbuildingMode={filters.deckbuildingMode} setDeckbuildingMode={changeFilter('deckbuildingMode')} />
                )}
                <Button variant="outline" className="!text-red-700" onClick={clearFilters}>
                  {t('filters.clear')}
                </Button>
                {missionsButton && (
                  <Link className="mt-2" to="/collection/missions">
                    <Button className="w-full" variant="outline">
                      {t('goToMissions')}
                    </Button>
                  </Link>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {share !== undefined && (
          <Button variant="outline" onClick={onShare}>
            {t('filters.share')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
