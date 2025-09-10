import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import TradeList from '@/pages/trade/components/TradeList.tsx'
import { usePublicAccount } from '@/services/account/useAccount.ts'
import { useTrades, useUpdateTrade } from '@/services/trade/useTrade.ts'
import type { TradeRow } from '@/types'

interface TradePartnerProps {
  friendId: string
}

function TradePartner({ friendId }: TradePartnerProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('trade-matches')

  const { data: trades } = useTrades()
  const { data: friendAccount } = usePublicAccount(friendId)
  const updateTradeMutation = useUpdateTrade()

  const [viewHistory, setViewHistory] = useState<boolean>(false)

  async function update(id: number, trade: Partial<TradeRow>) {
    updateTradeMutation.mutate({ id, trade })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 mx-1">
        <p>
          <span className="text-md">{t('tradingWith')}</span>
          <span className="text-md font-bold"> {friendAccount?.username || 'loading'} </span>
        </p>
        <span className="flex gap-4">
          <label htmlFor={`history-${friendId}`} className="my-auto flex items-center">
            {t('viewHistory')}
            <Switch id={`history-${friendId}`} className="ml-2 my-auto" checked={viewHistory} onCheckedChange={setViewHistory} />
          </label>
          <Button className="my-auto" onClick={() => navigate(`/trade/${friendId}`)}>
            {t('openTradeWith')}
          </Button>
        </span>
      </div>
      {friendAccount !== null && trades && (
        <TradeList
          trades={trades.filter((t) => t.offering_friend_id === friendId || t.receiving_friend_id === friendId)}
          update={update}
          viewHistory={viewHistory}
        />
      )}
    </div>
  )
}

export default TradePartner
