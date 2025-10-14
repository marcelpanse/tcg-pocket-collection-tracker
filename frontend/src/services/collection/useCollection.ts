import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { useAccount } from '@/services/account/useAccount.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import { getCollection, getPublicCollection, updateCards } from '@/services/collection/collectionService.ts'
import type { CardAmountUpdate } from '@/types'

export function useCollection() {
  const { data: user } = useUser()
  const email = user?.user.email
  const { data: account } = useAccount()
  const collectionLastUpdated = account?.collection_last_updated

  return useQuery({
    queryKey: ['collection', email],
    queryFn: () => getCollection(email as string, collectionLastUpdated),
    enabled: Boolean(email && account),
    staleTime: 10, //set a short stale time here because we handle the cache internally already (in case someone is using two devices at the same time)
  })
}

export function usePublicCollection(friendId: string | undefined) {
  return useQuery({
    queryKey: ['collection', friendId],
    queryFn: () => getPublicCollection(friendId as string),
    enabled: !!friendId,
  })
}

export function useUpdateCards() {
  const { data: user } = useUser()
  const email = user?.user.email

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ updates }: { updates: CardAmountUpdate[] }) => {
      if (!email) {
        throw new Error('Email is required to update cards')
      }
      return updateCards(email, updates)
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['collection', email], result.cards)

      // Update account data in cache (for collection_last_updated timestamp)
      queryClient.setQueryData(['account', email], result.account)
    },
  })
}

export function useSelectedCard() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useLoginDialog must be used within a ProfileDialogProvider')
  }
  return context
}
