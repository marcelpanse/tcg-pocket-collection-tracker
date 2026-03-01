import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount } from '@/services/account/useAccount'
import { getFriends, getPendingRequests, manageFriend } from './friendService'

export function useFriends() {
  const { data: account } = useAccount()
  const friendId = account?.friend_id

  return useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends(friendId as string),
    enabled: !!friendId,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
}

export function usePendingRequests() {
  const { data: account } = useAccount()
  const friendId = account?.friend_id

  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => getPendingRequests(friendId as string),
    enabled: !!friendId,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
}

export function useManageFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ friend_id, action }: { friend_id: string; action: string }) => manageFriend(friend_id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
    },
  })
}
