import { UserCheck, UserPlus, UserX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useLoginDialog, useUser } from '@/services/auth/useAuth'
import { useFriends, useManageFriend, usePendingRequests } from '@/services/friends/useFriends'

export default function Friends() {
  const { data: user } = useUser()
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { data: friends = [], isLoading: friendsLoading } = useFriends()
  const { data: pendingRequests = [], isLoading: pendingLoading } = usePendingRequests()
  const manageFriend = useManageFriend()
  const { toast } = useToast()
  const [friendIdInput, setFriendIdInput] = useState('')

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-lg mb-4">Please log in to manage your friends.</p>
        <Button onClick={() => setIsLoginDialogOpen(true)}>Log in</Button>
      </div>
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Add Friend */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Add Friend</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter friend ID"
            value={friendIdInput}
            onChange={(e) => setFriendIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
            className="max-w-xs"
          />
          <Button onClick={handleSendRequest} disabled={!friendIdInput.trim() || manageFriend.isPending}>
            <UserPlus className="h-4 w-4 mr-1" />
            Send Request
          </Button>
        </div>
      </section>

      {/* Pending Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
        {pendingLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">{req.username || req.friend_id}</span>
                <div className="flex gap-2">
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
      </section>

      {/* My Friends */}
      <section>
        <h2 className="text-xl font-semibold mb-3">My Friends</h2>
        {friendsLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : friends.length === 0 ? (
          <p className="text-muted-foreground">No friends yet. Add one above!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{friend.username || friend.friend_id}</span>
                  {friend.state === 'pending' && <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">Pending</span>}
                </div>
                <div className="flex gap-2">
                  {friend.state === 'accepted' && (
                    <Link to={`/trade/matches/results?highlighted=${friend.friend_id}`}>
                      <Button size="sm" variant="outline">
                        Trade Matches
                      </Button>
                    </Link>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleRevoke(friend.friend_id)} disabled={manageFriend.isPending}>
                    <UserX className="h-4 w-4 mr-1" />
                    {friend.state === 'pending' ? 'Cancel' : 'Remove'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
