import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { FriendIdDisplay } from '@/components/ui/friend-id-display.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import TradeList from '@/pages/trade/components/TradeList.tsx'
import { usePublicAccount } from '@/services/account/useAccount.ts'
import { useTrades } from '@/services/trade/useTrade.ts'

interface TradePartnerProps {
  friendId: string
}

function TradePartner({ friendId }: TradePartnerProps) {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: trades, isLoading: isLoadingTrades } = useTrades()
  const { data: friendAccount, isLoading: isLoadingAccount } = usePublicAccount(friendId)

  const [viewHistory, setViewHistory] = useState<boolean>(false)

  if (isLoadingTrades || isLoadingAccount) {
    return null
  }

  if (!trades) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  const partnerTrades = trades.filter((t) => t.offering_friend_id === friendId || t.receiving_friend_id === friendId)

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
      {friendAccount !== null && <TradeList trades={partnerTrades} viewHistory={viewHistory} />}
    </div>
  )
}

export default TradePartner
