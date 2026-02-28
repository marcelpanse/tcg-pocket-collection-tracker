import { ArrowRight, Clock, MessageSquare, UserCheck, UserPlus, Users, UserX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { Input } from '@/components/ui/input'
import { useChatContext } from '@/context/ChatContext'
import { useToast } from '@/hooks/use-toast'
import { useAccount } from '@/services/account/useAccount'
import { useLoginDialog, useUser } from '@/services/auth/useAuth'
import { useFriends, useManageFriend, usePendingRequests } from '@/services/friends/useFriends'

function FriendAvatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-neutral-200">{initials}</div>
  )
}

export default function Friends() {
  const { data: user } = useUser()
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { data: account } = useAccount()
  const { data: friends = [], isLoading: friendsLoading } = useFriends()
  const { data: pendingRequests = [], isLoading: pendingLoading } = usePendingRequests()
  const manageFriend = useManageFriend()
  const { toast } = useToast()
  const { openChat } = useChatContext()
  const [friendIdInput, setFriendIdInput] = useState('')

  if (!user) {
    return (
      <main>
        <article className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
            <Users className="h-8 w-8 text-neutral-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Friends</h1>
          <p className="mb-8 text-neutral-400">Log in to connect with friends and see trade opportunities.</p>
          <Button onClick={() => setIsLoginDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Log in to continue
          </Button>
        </article>
      </main>
    )
  }

  const handleSendRequest = () => {
    const trimmed = friendIdInput.trim()
    if (!trimmed) {
      return
    }
    manageFriend.mutate(
      { friend_id: trimmed, action: 'send_request' },
      {
        onSuccess: () => {
          toast({ title: 'Friend request sent!' })
          setFriendIdInput('')
        },
        onError: (err) => {
          toast({ variant: 'destructive', title: 'Error', description: err.message })
        },
      },
    )
  }

  const handleAccept = (friend_id: string) => {
    manageFriend.mutate(
      { friend_id, action: 'accept' },
      {
        onSuccess: () => toast({ title: 'Friend request accepted!' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
      },
    )
  }

  const handleDecline = (friend_id: string) => {
    manageFriend.mutate(
      { friend_id, action: 'decline' },
      {
        onSuccess: () => toast({ title: 'Friend request declined.' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
      },
    )
  }

  const handleRevoke = (friend_id: string) => {
    manageFriend.mutate(
      { friend_id, action: 'revoke' },
      {
        onSuccess: () => toast({ title: 'Friend removed.' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
      },
    )
  }

  const acceptedFriends = friends.filter((f) => f.state === 'accepted')
  const pendingSent = friends.filter((f) => f.state === 'pending')

  return (
    <main>
      <article className="mx-auto max-w-2xl px-4 sm:px-8 py-10 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
            <Users className="h-5 w-5 text-neutral-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Friends</h1>
            <p className="text-sm text-neutral-400">Connect with others to find trade matches</p>
          </div>
        </div>

        {/* Your Friend ID */}
        {account?.friend_id && (
          <div className="rounded-xl border border-neutral-700 bg-neutral-800/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Your Friend ID</p>
            <p className="text-sm text-neutral-400 mb-3">Share this with others so they can add you.</p>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-3">
              <FriendIdDisplay friendId={account.friend_id} className="text-sm font-mono flex-1" />
            </div>
          </div>
        )}

        {/* Add Friend */}
        <div className="rounded-xl border border-neutral-700 bg-neutral-800/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Add Friend</p>
          <p className="text-sm text-neutral-400 mb-4">Enter a friend's ID to send them a request.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter friend ID"
              value={friendIdInput}
              onChange={(e) => setFriendIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
              className="border-neutral-700 bg-neutral-900"
            />
            <Button onClick={handleSendRequest} disabled={!friendIdInput.trim() || manageFriend.isPending} className="shrink-0">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Send Request
            </Button>
          </div>
        </div>

        {/* Pending Requests (incoming) */}
        {(pendingLoading || pendingRequests.length > 0) && (
          <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-semibold text-amber-300">
                Pending Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">{pendingRequests.length}</span>
                )}
              </p>
            </div>
            {pendingLoading ? (
              <p className="text-neutral-400 text-sm">Loading...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg bg-neutral-800/80 border border-neutral-700 p-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FriendAvatar name={req.username || req.friend_id} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{req.username || req.friend_id}</p>
                        <FriendIdDisplay friendId={req.friend_id} showCopyButton={false} className="text-xs text-neutral-500" />
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleAccept(req.friend_id)} disabled={manageFriend.isPending}>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecline(req.friend_id)} disabled={manageFriend.isPending}>
                        <UserX className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends list */}
        <div className="rounded-xl border border-neutral-700 bg-neutral-800/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            My Friends
            {acceptedFriends.length > 0 && <span className="ml-2 normal-case font-normal text-neutral-400">({acceptedFriends.length})</span>}
          </p>

          {friendsLoading ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : acceptedFriends.length === 0 && pendingSent.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700">
                <Users className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-400">No friends yet.</p>
              <p className="text-xs text-neutral-500 mt-1">Send a request above to get started!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {acceptedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex flex-col gap-2 rounded-lg bg-neutral-900/60 border border-neutral-700 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FriendAvatar name={friend.username || friend.friend_id} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{friend.username || friend.friend_id}</p>
                      <FriendIdDisplay friendId={friend.friend_id} showCopyButton={false} className="text-xs text-neutral-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none"
                      onClick={() => openChat(friend.friend_id, friend.username || friend.friend_id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Chat
                    </Button>
                    <Link to={`/trade/${friend.friend_id}`} className="flex-1 md:flex-none">
                      <Button size="sm" variant="outline" className="w-full">
                        Trade matches
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevoke(friend.friend_id)}
                      disabled={manageFriend.isPending}
                      className="text-neutral-500 hover:text-red-400 hover:bg-red-900/20"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Sent requests awaiting acceptance */}
              {pendingSent.length > 0 && (
                <>
                  {acceptedFriends.length > 0 && <hr className="border-neutral-700 my-1" />}
                  <p className="text-xs text-neutral-500 mb-1 mt-1">Sent requests</p>
                  {pendingSent.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between rounded-lg bg-neutral-900/60 border border-neutral-700 p-3 gap-3 opacity-70"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FriendAvatar name={friend.username || friend.friend_id} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{friend.username || friend.friend_id}</p>
                            <span className="text-xs border border-neutral-600 rounded-full px-2 py-0.5 text-neutral-400">Pending</span>
                          </div>
                          <FriendIdDisplay friendId={friend.friend_id} showCopyButton={false} className="text-xs text-neutral-500" />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevoke(friend.friend_id)}
                        disabled={manageFriend.isPending}
                        className="shrink-0 text-neutral-500 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
