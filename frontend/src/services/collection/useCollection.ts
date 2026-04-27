import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { useToast } from '@/hooks/use-toast.ts'
import { useAccount } from '@/services/account/useAccount.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import {
  deleteCard,
  getCollection,
  getPublicCollection,
  updateAmountWanted,
  updateCards,
  updateCollectionTimestamp,
} from '@/services/collection/collectionService.ts'
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
    staleTime: 10, // Set a short stale time here because we handle the cache internally already (in case someone is using two devices at the same time)
  })
}

export function usePublicCollection(friendId: string | undefined) {
  return useQuery({
    queryKey: ['collection', friendId],
    queryFn: () => getPublicCollection(friendId as string),
    enabled: !!friendId,
    staleTime: Infinity, // Public collections don't change while viewing and we don't want to refetch, so cache indefinitely
  })
}

export function useUpdateCards() {
  const { toast } = useToast()
  const { data: user } = useUser()
  const email = user?.user.email

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: CardAmountUpdate[]) => {
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
    onError: async (error) => {
      toast({ title: 'Error updating cards', description: error.message, variant: 'destructive' })
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['collection'] }), queryClient.invalidateQueries({ queryKey: ['account'] })])
    },
  })
}

export function useUpdateAmountWanted() {
  const { toast } = useToast()
  const { data: user } = useUser()
  const email = user?.user.email

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ internal_id, amount_wanted, do_insert }: { internal_id: number; amount_wanted: number | null; do_insert?: boolean }) => {
      if (!email) {
        throw new Error('Email is required to update amount wanted')
      }
      const now = new Date()
      return Promise.all([updateAmountWanted(email, internal_id, amount_wanted, now, do_insert), updateCollectionTimestamp(email, now)])
    },
    onSuccess: async ([cards, account]) => {
      queryClient.setQueryData(['collection', email], cards)
      queryClient.setQueryData(['account', email], account)
    },
    onError: async (error) => {
      toast({ title: 'Error updating cards', description: error.message, variant: 'destructive' })
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['collection'] }), queryClient.invalidateQueries({ queryKey: ['account'] })])
    },
  })
}

export function useDeleteCard() {
  const { data: user } = useUser()
  const email = user?.user.email

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId }: { cardId: string }) => {
      if (!email) {
        throw new Error('Email is required to delete card')
      }
      return deleteCard(email, cardId)
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
