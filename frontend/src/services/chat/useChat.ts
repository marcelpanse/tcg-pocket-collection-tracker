import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount } from '@/services/account/useAccount'
import { getMessages, getUnreadCounts, markAsRead, sendMessage } from './chatService'

export function useMessages(theirFriendId: string | undefined) {
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id

  return useQuery({
    queryKey: ['messages', myFriendId, theirFriendId],
    queryFn: () => getMessages(myFriendId as string, theirFriendId as string),
    enabled: !!myFriendId && !!theirFriendId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id

  return useMutation({
    mutationFn: ({ receiverFriendId, content }: { receiverFriendId: string; content: string }) => {
      if (!myFriendId) {
        throw new Error('Not logged in')
      }
      return sendMessage(myFriendId, receiverFriendId, content)
    },
    onSuccess: (_, { receiverFriendId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', myFriendId, receiverFriendId] })
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id

  return useMutation({
    mutationFn: ({ theirFriendId }: { theirFriendId: string }) => {
      if (!myFriendId) {
        throw new Error('Not logged in')
      }
      return markAsRead(myFriendId, theirFriendId)
    },
    onSuccess: (_, { theirFriendId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', myFriendId, theirFriendId] })
      queryClient.invalidateQueries({ queryKey: ['unreadCounts', myFriendId] })
    },
  })
}

export function useUnreadCounts() {
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id

  return useQuery({
    queryKey: ['unreadCounts', myFriendId],
    queryFn: () => getUnreadCounts(myFriendId as string),
    enabled: !!myFriendId,
  })
}
