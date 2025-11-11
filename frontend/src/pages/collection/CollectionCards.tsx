import { CircleAlert } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useSearchParams } from 'react-router'
import { Tooltip } from 'react-tooltip'
import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import {
  type CardTypeOption,
  cardTypeOptions,
  expansionOptions,
  type Filters,
  type FiltersAll,
  getFilteredCards,
  ownedOptions,
  sortByOptions,
} from '@/lib/filters'
import { useProfileDialog } from '@/services/account/useAccount'
import { useCollection } from '@/services/collection/useCollection'
import { type Card, type CollectionRow, type Rarity, rarities } from '@/types'

const numberParser = (s: string) => {
  const x = Number(s)
  return Number.isNaN(x) ? undefined : x
}
const boolParser = (s: string) => {
  return s === 'true' ? true : s === 'false' ? false : undefined
}

const filterParsers: { [K in keyof FiltersAll]: (s: string) => Filters[K] | undefined } = {
  search: (s) => s,
  expansion: (s) => ((expansionOptions as readonly string[]).includes(s) ? (s as Filters['expansion']) : undefined),
  pack: (s) => s,
  cardType: (s) => s.split(',').filter((x): x is CardTypeOption => (cardTypeOptions as readonly string[]).includes(x)),
  rarity: (s) => s.split(',').filter((x): x is Rarity => (rarities as readonly string[]).includes(x)),
  owned: (s) => ((ownedOptions as readonly string[]).includes(s) ? (s as Filters['owned']) : undefined),
  sortBy: (s) => ((sortByOptions as readonly string[]).includes(s) ? (s as Filters['sortBy']) : undefined),
  minNumber: numberParser,
  maxNumber: numberParser,
  deckbuildingMode: boolParser,
  allTextSearch: boolParser,
}

interface FiltersSidePanelProps {
  children: ReactNode
  cards: Card[]
  share?: boolean // undefined => disable, false => open settings, true => copy link
  isPublic: boolean
}

function FiltersSidePanel({ children, cards, share, isPublic }: FiltersSidePanelProps) {
  const { t } = useTranslation('pages/collection')
  const navigate = useNavigate()
  const { setIsProfileDialogOpen } = useProfileDialog()
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()

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

  const totalOwned = useMemo(() => {
    let total = 0
    const uniqueCardsByCardId = new Set<number>()
    for (const card of cards) {
      if (!uniqueCardsByCardId.has(card.internal_id)) {
        total += card.amount_owned || 0
        uniqueCardsByCardId.add(card.internal_id)
      }
    }
    return total
  }, [cards])

  const mewCardOwned = useMemo(() => {
    return Boolean((ownedCards?.get(83654)?.amount_owned ?? 0) > 0)
  }, [cards])

  return (
    <div className="flex flex-col h-fit gap-2">
      <small className="flex gap-2">
        {t('stats.summary', {
          selected: cards.length,
          uniquesOwned: cards.filter((card) => Boolean(card.collected)).length,
          totalOwned,
        })}
        {mewCardOwned && (
          <>
            <Tooltip id="mewCardOwned" className="text-start max-w-72" clickable={true} />
            <CircleAlert className="h-5 w-5" data-tooltip-id="mewCardOwned" data-tooltip-content={t('stats.mewCardOwned')} />
          </>
        )}
      </small>
      {children}
      <div className="flex flex-col mt-4 gap-2">
        {share !== undefined && (
          <Button variant="outline" onClick={onShare}>
            {t('filters.share')}
          </Button>
        )}
        {!isPublic && (
          <Button variant="outline" onClick={() => navigate('/collection/missions')}>
            {t('goToMissions')}
          </Button>
        )}
      </div>
    </div>
  )
}

interface Props {
  children?: ReactNode
  cards: Map<number, CollectionRow>
  isPublic: boolean
  share?: boolean // undefined => disable, false => open settings, true => copy link
}

export default function CollectionCards({ children, cards, isPublic, share }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false) // used only on mobile

  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const res: Filters = {
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

    const updateFilter = <K extends keyof Filters>(key: K, value: string) => {
      const parsed = filterParsers[key](value) as Filters[K]
      if (parsed !== undefined) {
        res[key] = parsed
      }
    }

    for (const key in res) {
      const raw = searchParams.get(key)
      if (raw != null) {
        updateFilter(key as keyof Filters, raw)
      }
    }
    return res
  }, [searchParams])

  const setFilters = (updates: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams)
    for (const key in updates) {
      const val = updates[key as keyof Filters]
      if (val == null || val === 'all' || (Array.isArray(val) && val.length === 0) || val === '') {
        params.delete(key)
      } else if (Array.isArray(val)) {
        params.set(key, val.join(','))
      } else {
        params.set(key, String(val))
      }
      setSearchParams(params)
    }
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const filteredCards = useMemo(() => getFilteredCards(filters, cards), [filters, cards])

  return (
    <div className="flex justify-center gap-2 xl:gap-8 px-1">
      {isMobile ? (
        <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersSidePanel cards={filteredCards} share={share} isPublic={isPublic}>
              <FilterPanel className="flex flex-col gap-y-3" filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
            </FiltersSidePanel>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80">
          <FiltersSidePanel cards={filteredCards} share={share} isPublic={isPublic}>
            <FilterPanel className="flex flex-col gap-y-3" filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
          </FiltersSidePanel>
        </div>
      )}
      <div className="w-full max-w-[900px]">
        {isMobile && (
          <Button variant="outline" className="w-full mb-1" onClick={() => setIsFiltersSheetOpen(true)}>
            Filters
          </Button>
        )}
        {filteredCards && (
          <CardsTable cards={filteredCards} editable={!filters.deckbuildingMode && !isPublic} groupExpansions={filters.sortBy !== 'recent'}>
            {children}
          </CardsTable>
        )}
      </div>
    </div>
  )
}
