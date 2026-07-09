import { useQuery } from '@tanstack/react-query'
import { ChevronFirst, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router'
import ErrorAlert from '@/components/ErrorAlert'
import { Spinner } from '@/components/Spinner'
import { Alert } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { Switch } from '@/components/ui/switch'
import { useChatContext } from '@/context/ChatContext'
import { useToast } from '@/hooks/use-toast'
import { publicAccountQuery, useAccount } from '@/services/account/useAccount'
import { useFriends, useManageFriend } from '@/services/friends/useFriends'
import { useAllTrades } from '@/services/trade/useTrade'
import TradeList from './components/TradeList'
import TradeWithTable from './components/TradeWithTable'

function TradeWith() {
  const { t } = useTranslation(['trade-matches', 'common'])
  const { friendId } = useParams()

  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: friendAccount, isLoading: isLoadingFriendAccount } = useQuery(publicAccountQuery(friendId))

  const { data: friends = [] } = useFriends()
  const manageFriend = useManageFriend()
  const { toast } = useToast()
  const { openChat } = useChatContext()

  const [viewHistory, setViewHistory] = useState(false)
  const [pageHistory, setPageHistory] = useState(0)
  const allTrades = useAllTrades(friendId, viewHistory, pageHistory, true)

  if (isLoadingAccount || isLoadingFriendAccount) {
    return <Spinner size="lg" overlay />
  }

  if (friendAccount === undefined) {
    return <ErrorAlert />
  }

  if (friendAccount === null) {
    return <p className="text-xl text-center py-8">{t('notFound')}</p>
  }

  if (account === undefined) {
    // User not logged in
    return <Navigate to={`/collection/${friendId}`} replace />
  }

  if (!account.username || !account.friend_id) {
    return <Alert className="mb-8 border-1 border-neutral-700 shadow-none">{t('noAccount')}</Alert>
  }

  if (!friendAccount?.is_active_trading) {
    return (
      <div className="text-center py-8">
        <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
        <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
      </div>
    )
  }

  const isAlreadyFriend = friends.some((f) => f.friend_id === friendAccount.friend_id && f.state === 'accepted')
  const hasPendingRequest = friends.some((f) => f.friend_id === friendAccount.friend_id && f.state === 'pending')

  const handleAddFriend = () => {
    manageFriend.mutate(
      { friend_id: friendAccount.friend_id, action: 'send_request' },
      {
        onSuccess: () => toast({ title: 'Friend request sent!' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
      },
    )
  }

  return (
    <>
      <title>{`Trade with ${friendAccount.username} – TCG Pocket Collection Tracker`}</title>
      <div className="flex flex-col gap-4 w-full mb-4">
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 justify-between">
            <div>
              <h1>
                <span className="text-2xl font-light">{t('tradingWith')}</span>
                <span className="text-2xl font-bold"> {friendAccount.username}</span>
                {friendAccount.language && <span className="text-lg bg-neutral-800 px-2 rounded-full ml-1">{friendAccount.language}</span>}
              </h1>
              <p>
                <FriendIdDisplay
                  friendId={friendAccount.friend_id}
                  onChat={isAlreadyFriend ? () => openChat(friendAccount.friend_id, friendAccount.username || friendAccount.friend_id) : undefined}
                />
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 [&>*]:w-full">
              <div className="flex items-center">
                <label htmlFor={`history-${friendId}`} className="whitespace-nowrap">
                  {t('viewHistory')}
                </label>
                <Switch
                  id={`history-${friendId}`}
                  className="ml-2"
                  checked={viewHistory}
                  onCheckedChange={(x) => {
                    setViewHistory(x)
                    setPageHistory(0)
                  }}
                />
              </div>
              {!isAlreadyFriend && (
                <Button
                  variant="outline"
                  onClick={handleAddFriend}
                  disabled={manageFriend.isPending || hasPendingRequest}
                  title={hasPendingRequest ? 'Friend request already sent' : undefined}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {hasPendingRequest ? 'Request Sent' : 'Add Friend'}
                </Button>
              )}
              <Link to={`/collection/${friendId}`}>
                <Button variant="outline" className="w-full">
                  Collection
                  <ChevronRight />
                </Button>
              </Link>
            </div>
          </div>
          <hr className="border-neutral-700 my-2" />
          {allTrades.isLoading ? (
            <Spinner size="md" />
          ) : (
            allTrades.data && (
              <>
                <TradeList trades={allTrades.data.trades} />
                <div className="flex justify-between items-center mt-2">
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
                </div>
              </>
            )
          )}
        </div>

        <TradeWithTable ownAccount={account} friendAccount={friendAccount} />
      </div>
    </>
  )
}

export default TradeWith
