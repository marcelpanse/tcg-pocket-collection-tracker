import i18n from 'i18next'
import { CircleAlert, Trash2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { Link, useSearchParams } from 'react-router'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { Card } from '@/components/Card'
import { CardsTable } from '@/components/CardsTable.tsx'
import FiltersPanel from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import useSearchState from '@/hooks/use-search-state'
import { toast } from '@/hooks/use-toast'
import { getFilteredCards, ownershipOptions, sortByOptions, tradingOptions } from '@/lib/filters'
import { getCardNameByLang } from '@/lib/utils.ts'
import { useAccount, useProfileDialog } from '@/services/account/useAccount'
import { type Card as CardType, type CollectionRow, cardTypes, expansionIds, rarities } from '@/types'

const schema = z.object({
  search: z.string().default(''),
  expansion: z.union([z.enum(expansionIds), z.literal('all')]).default('all'),
  pack: z.string().default('all'),
  cardType: z.array(z.enum(cardTypes)).default([]),
  rarity: z.array(z.enum(rarities)).default([]),
  ownership: z.enum(ownershipOptions).default('all'),
  trading: z.enum(tradingOptions).default('all'),
  sortBy: z.enum(sortByOptions).default('expansion-newest'),
  sortDesc: z.boolean().default(false),
  minNumber: z.number().default(0),
  maxNumber: z.union([z.number(), z.literal('∞')]).default('∞'),
  deckbuildingMode: z.boolean().default(false),
  allTextSearch: z.boolean().default(false),
})

interface Props {
  children?: ReactNode
  cards: Map<number, CollectionRow>
  isPublic: boolean
  share?: boolean // undefined => disable, false => open settings, true => copy link
}

export default function CollectionCards({ children, cards, isPublic, share }: Props) {
  const { t } = useTranslation('pages/collection')
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' }) // tailwind "md"

  const { setIsProfileDialogOpen } = useProfileDialog()
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false) // used only on mobile
  const { data: account } = useAccount()

  const [filters, setFilters, activeFilters] = useSearchState(schema)
  const [_, setSearchParams] = useSearchParams()
  const clearFilters = () => setSearchParams(new URLSearchParams())

  const filteredCards = getFilteredCards(filters, cards, account?.trade_rarity_settings)

  const getTradingMessage = () => {
    if (!account) {
      throw new Error('Cannot copy trade message without account')
    }
    let cardValues = ''

    if (account.is_public) {
      cardValues += `${t('trade.publicTradePage')}: https://tcgpocketcollectiontracker.com/#/trade/${account?.friend_id}\n`
    }
    if (account.username) {
      cardValues += `${t('trade.friendID')}: ${account.friend_id} (${account.username})\n\n`
    }

    const putCards = (arr: CardType[]) => {
      arr.sort((a: CardType, b: CardType) => {
        const expansionComparison = a.expansion.localeCompare(b.expansion)
        if (expansionComparison !== 0) {
          return expansionComparison
        }
        return a.rarity.localeCompare(b.rarity)
      })

      for (let i = 0; i < arr.length; i++) {
        const prevExpansion = i > 0 ? arr[i - 1].expansion : ''
        if (prevExpansion !== arr[i].expansion) {
          cardValues += `\n${arr[i].expansion}:\n`
        }
        cardValues += `${arr[i].rarity} ${arr[i].card_id} - ${getCardNameByLang(arr[i], i18n.language)}\n`
      }
    }

    cardValues += `${t('trade.lookingForCards')}:\n`
    putCards(getFilteredCards({ ...filters, trading: 'wanted' }, cards, account.trade_rarity_settings))

    cardValues += `\n\n${t('trade.forTradeCards')}:\n`
    putCards(getFilteredCards({ ...filters, trading: 'extra' }, cards, account.trade_rarity_settings))

    return cardValues
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

  const totalOwned = () => {
    let total = 0
    const uniqueCardsByCardId = new Set<number>()
    for (const card of filteredCards) {
      if (card.collected && !uniqueCardsByCardId.has(card.internal_id)) {
        total += card.amount_owned || 0
        uniqueCardsByCardId.add(card.internal_id)
      }
    }
    return total
  }

  const mewCardOwned = Boolean((cards?.get(83654)?.amount_owned ?? 0) > 0)

  const filtersPanel = (
    <div className="flex flex-col h-fit gap-2">
      <small className="flex gap-2">
        {t('stats.summary', {
          selected: filteredCards.length,
          uniquesOwned: filteredCards.filter((card) => Boolean(card.collected)).length,
          totalOwned: totalOwned(),
        })}
        {mewCardOwned && (
          <>
            <Tooltip id="mewCardOwned" className="text-start max-w-72" clickable={true} />
            <CircleAlert className="h-5 w-5" data-tooltip-id="mewCardOwned" data-tooltip-content={t('stats.mewCardOwned')} />
          </>
        )}
      </small>
      <FiltersPanel className="flex flex-col gap-y-3" filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      <div className="flex flex-col mt-4 gap-2">
        {share !== undefined && (
          <Button variant="outline" onClick={onShare}>
            {t('filters.share')}
          </Button>
        )}
        {!isPublic && (
          <Button
            className="w-full"
            variant="outline"
            disabled={!account}
            onClick={() =>
              navigator.clipboard.writeText(getTradingMessage()).then(() => toast({ title: t('trade.copiedInClipboard'), variant: 'default', duration: 3000 }))
            }
          >
            {t('trade.button')}
          </Button>
        )}
        {!isPublic && (
          <Link className="w-full" to="/collection/missions">
            <Button className="w-full" variant="outline">
              {t('goToMissions')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex justify-center gap-2 xl:gap-8 px-1">
      {isMobile ? (
        <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            {filtersPanel}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80">{filtersPanel}</div>
      )}
      <div className="w-full max-w-[900px]">
        {isMobile && (
          <div className="h-9 flex overflow-hidden text-center rounded-md text-sm font-medium border shadow-sm border-neutral-700 divide-x divide-neutral-700 [&>*]:cursor-pointer [&>*]:hover:bg-neutral-600 [&>*]:hover:text-neutral-50">
            <button type="button" className="flex-1" onClick={() => setIsFiltersSheetOpen(true)}>
              Filters
              {activeFilters > 0 && ` (${activeFilters})`}
            </button>
            {activeFilters > 0 && (
              <button type="button" className="group px-2" onClick={clearFilters}>
                <Trash2 className="stroke-neutral-200 group-hover:stroke-neutral-50" />
              </button>
            )}
          </div>
        )}
        {children}
        <CardsTable
          cards={filteredCards}
          groupExpansions={filters.sortBy === 'expansion-newest'}
          render={(c) => <Card card={c} editable={!filters.deckbuildingMode && !isPublic} />}
        />
      </div>
    </div>
  )
}
