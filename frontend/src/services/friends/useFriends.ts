import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/services/auth/useAuth.ts'
import { getFriends, getPendingRequests, manageFriend } from './friendService'

export function useFriends() {
  const { data: user } = useUser()
  const email = user?.user.email

  return useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends(email as string),
    enabled: !!email,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
}

export function usePendingRequests() {
  const { data: user } = useUser()
  const email = user?.user.email

  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => getPendingRequests(email as string),
    enabled: !!email,
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
