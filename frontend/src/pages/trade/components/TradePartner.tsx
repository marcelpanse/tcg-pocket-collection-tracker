import { ChevronFirst, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button.tsx'
import { FriendIdDisplay } from '@/components/ui/friend-id-display.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { useChatContext } from '@/context/ChatContext'
import TradeList from '@/pages/trade/components/TradeList.tsx'
import { usePublicAccount } from '@/services/account/useAccount.ts'
import { useFriends } from '@/services/friends/useFriends'
import { useAllTrades } from '@/services/trade/useTrade'
import type { TradeRow } from '@/types'

interface TradePartnerProps {
  friendId: string
  activeTrades: TradeRow[]
}

function TradePartner({ friendId, activeTrades }: TradePartnerProps) {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: friendAccount, isLoading: isLoadingAccount } = usePublicAccount(friendId)
  const { data: friends = [] } = useFriends()
  const { openChat } = useChatContext()
  const isAlreadyFriend = friends.some((f) => f.friend_id === friendId)

  const [viewHistory, setViewHistory] = useState(false)
  const [pageHistory, setPageHistory] = useState(0)
  const allTrades = useAllTrades(friendId, viewHistory, pageHistory, viewHistory)

  if (isLoadingAccount) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 mx-1">
        <p>
          <span className="text-md">{t('tradingWith')}</span>
          <span className="text-md font-bold"> {friendAccount?.username || 'unknown'} </span>
          {friendAccount && (
            <FriendIdDisplay
              friendId={friendAccount.friend_id}
              showFriendId={false}
              className="ml-1"
              onChat={isAlreadyFriend ? () => openChat(friendAccount.friend_id, friendAccount.username || friendAccount.friend_id) : undefined}
            />
          )}
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
          allTrades.data && (
            <TradeList trades={allTrades.data.trades}>
              <p className="flex justify-between mt-2">
                <span className="text-neutral-400">{allTrades.data.count} total offers</span>
                <div className="flex items-center gap-2">
                  <span>Page {pageHistory + 1}</span>
                  <Button variant="outline" onClick={() => setPageHistory(() => 0)} disabled={pageHistory <= 0}>
                    <ChevronFirst />
                  </Button>
                  <Button variant="outline" onClick={() => setPageHistory((prev) => prev - 1)} disabled={pageHistory <= 0}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" onClick={() => setPageHistory((prev) => prev + 1)} disabled={!allTrades.data.hasNext}>
                    <ChevronRight />
                  </Button>
                </div>
              </p>
            </TradeList>
          )
        )
      ) : (
        <TradeList trades={activeTrades} />
      )}
    </div>
  )
}

export default TradePartner
