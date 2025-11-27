import { CircleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Tooltip } from 'react-tooltip'
import FiltersPanel from '@/components/FiltersPanel'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { Filters } from '@/lib/filters'
import { useProfileDialog } from '@/services/account/useAccount'
import { useCollection } from '@/services/collection/useCollection'
import type { Card, CollectionRow } from '@/types'

interface Props {
  cards: Card[]
  filters: Filters
  setFilters: (updates: Partial<Filters>) => void
  clearFilters: () => void
  share?: boolean // undefined => disable, false => open settings, true => copy link
  missions?: boolean
}

export default function CollectionFiltersPanel({ cards, filters, setFilters, clearFilters, share, missions }: Props) {
  const { t } = useTranslation('pages/collection')
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
      if (card.collected && !uniqueCardsByCardId.has(card.internal_id)) {
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
      <FiltersPanel className="flex flex-col gap-y-3" filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      <div className="flex flex-col mt-4 gap-2">
        {share !== undefined && (
          <Button variant="outline" onClick={onShare}>
            {t('filters.share')}
          </Button>
        )}
        {missions && (
          <Link className="w-full" to="/collection/missions">
            <Button className="w-full" variant="outline">
              {t('goToMissions')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
