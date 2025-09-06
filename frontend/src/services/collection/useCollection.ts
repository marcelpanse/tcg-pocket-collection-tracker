import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAccount } from '@/services/account/useAccount.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import type { CollectionRowUpdate } from '@/types'
import { collectionService } from './collectionService'

export function useCollection() {
  const { data: user } = useUser()
  const email = user?.user.email
  const { data: account } = useAccount()
  const collectionLastUpdated = account?.collection_last_updated

  return useQuery({
    queryKey: ['collection', email],
    queryFn: () => collectionService.fetchCollection(email || '', collectionLastUpdated),
    enabled: Boolean(email && account),
  })
}

export function usePublicCollection(friendId: string | undefined) {
  return useQuery({
    queryKey: ['collection', friendId],
    queryFn: () => collectionService.fetchPublicCollection(friendId || ''),
    enabled: !!friendId,
  })
}

export function useUpdateCards() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, updates }: { email: string; updates: CollectionRowUpdate[] }) => collectionService.updateCards(email, updates),
    onSuccess: (result, { email }) => {
      queryClient.setQueryData(['collection', email], result.cards)

      // Update account data in cache (for collection_last_updated timestamp)
      queryClient.setQueryData(['account', email], result.account)
    },
  })
}

//TODO: this is probably wrong
// UI state hooks to replace the selected card/mission state from CollectionContext
export function useSelectedCard() {
  const [selectedCardId, setSelectedCardId] = useState('')
  const selectCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId)
  }, [])
  const clearSelectedCard = useCallback(() => {
    setSelectedCardId('')
  }, [])
  return {
    selectedCardId,
    setSelectedCardId,
    selectCard,
    clearSelectedCard,
  }
}

export function useSelectedMissionCardOptions() {
  const [options, setOptions] = useState<string[]>([])
  const selectMissionCardOptions = useCallback((cardOptions: string[]) => {
    setOptions(cardOptions)
  }, [])
  const clearMissionCardOptions = useCallback(() => {
    setOptions([])
  }, [])
  return {
    selectedMissionCardOptions: options,
    setSelectedMissionCardOptions: setOptions,
    selectMissionCardOptions,
    clearMissionCardOptions,
  }
}
