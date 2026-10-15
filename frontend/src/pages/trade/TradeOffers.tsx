import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ErrorAlert from '@/components/ErrorAlert'
import { Spinner } from '@/components/Spinner'
import { Alert } from '@/components/ui/alert.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { groupTrades, tradeNeedsAttention } from '@/lib/utils'
import TradePartner from '@/pages/trade/components/TradePartner.tsx'
import { useAccount } from '@/services/account/useAccount'
import { useActiveTrades } from '@/services/trade/useTrade.ts'
import type { TradeRow } from '@/types'

const ATTENTION_FILTER_KEY = 'trade-offers-needs-attention'

function readAttentionFilter() {
  try {
    return localStorage.getItem(ATTENTION_FILTER_KEY) === 'true'
  } catch {
    return false
  }
}

function TradeOffers() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: trades, isLoading: isLoadingTrades } = useActiveTrades()
  const [onlyNeedsAttention, setOnlyNeedsAttention] = useState(readAttentionFilter)

  const toggleNeedsAttention = (checked: boolean) => {
    setOnlyNeedsAttention(checked)
    try {
      localStorage.setItem(ATTENTION_FILTER_KEY, String(checked))
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }

  if (isLoadingAccount || isLoadingTrades) {
    return <Spinner size="lg" overlay />
  }

  if (!account) {
    return t('noAccount')
  }

  if (!trades) {
    return <ErrorAlert />
  }

  if (!account.username || !account.friend_id) {
    return <Alert className="mb-8 border-1 border-neutral-700 shadow-none">{t('noAccount')}</Alert>
  }

  if (trades.length === 0) {
    return <p>{t('noTradeOffers')}</p>
  }

  const attentionTrades = trades.filter((row) => tradeNeedsAttention(row, account.friend_id as string))
  const visibleTrades = onlyNeedsAttention ? attentionTrades : trades

  //split into two groups for finished and ongoing trades
  const friends = groupTrades(visibleTrades, account.friend_id)
  const friendsLastActivity = Object.fromEntries(
    Object.entries(friends).map(([key, value]) => [key, Math.max(...(value as TradeRow[]).map((row) => new Date(row.updated_at).getTime()))]),
  )
  const friendIds = Object.keys(friends).toSorted((a, b) => {
    return friendsLastActivity[b] - friendsLastActivity[a]
  })

  return (
    <div className="flex flex-col items-center mx-auto gap-4 sm:px-4 mb-12 w-full">
      <div className="flex w-full justify-end">
        <label htmlFor="needs-attention" className="flex items-center gap-2 cursor-pointer">
          {t('needsAttention')}
          <span className="text-xs px-2 rounded-full bg-amber-600">{attentionTrades.length}</span>
          <Switch id="needs-attention" checked={onlyNeedsAttention} onCheckedChange={toggleNeedsAttention} />
        </label>
      </div>
      {friendIds.length === 0 && <p>{t('noTradesNeedAttention')}</p>}
      {friendIds.map((friend_id) => (
        <TradePartner key={friend_id} friendId={friend_id} activeTrades={friends[friend_id] as TradeRow[]} />
      ))}
    </div>
  )
}

export default TradeOffers
