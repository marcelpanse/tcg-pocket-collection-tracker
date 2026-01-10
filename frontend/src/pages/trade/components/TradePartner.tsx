import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button.tsx'
import { FriendIdDisplay } from '@/components/ui/friend-id-display.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import TradeList from '@/pages/trade/components/TradeList.tsx'
import { usePublicAccount } from '@/services/account/useAccount.ts'
import { getAllTrades } from '@/services/trade/tradeService'
import type { TradeRow } from '@/types'

interface TradePartnerProps {
  friendId: string
  activeTrades: TradeRow[]
}

function TradePartner({ friendId, activeTrades }: TradePartnerProps) {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: friendAccount, isLoading: isLoadingAccount } = usePublicAccount(friendId)

  const [viewHistory, setViewHistory] = useState<boolean>(false)
  const allTrades = useQuery({
    queryKey: ['trades', friendId],
    queryFn: () => getAllTrades(friendId),
    enabled: viewHistory,
  })

  if (isLoadingAccount) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 mx-1">
        <p>
          <span className="text-md">{t('tradingWith')}</span>
          <span className="text-md font-bold"> {friendAccount?.username || 'unknown'} </span>
          {friendAccount && <FriendIdDisplay friendId={friendAccount.friend_id} showFriendId={false} className="ml-1" />}
        </p>
        <span className="flex gap-4">
          <label htmlFor={`history-${friendId}`} className="my-auto flex items-center">
            {t('viewHistory')}
            <Switch id={`history-${friendId}`} className="ml-2 my-auto" checked={viewHistory} onCheckedChange={setViewHistory} />
          </label>
          <Link to={`/trade/${friendId}`}>
            <Button variant="outline" className="my-auto">
              {t('openTradeWith')}
              <ChevronRight />
            </Button>
          </Link>
        </span>
      </div>
      {viewHistory ? (
        allTrades.isLoading ? (
          <Spinner size="md" />
        ) : (
          allTrades.data && <TradeList trades={allTrades.data} />
        )
      ) : (
        <TradeList trades={activeTrades} />
      )}
    </div>
  )
}

export default TradePartner
