import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Deck } from '@/types'
import { useUser } from '../auth/useAuth'
import { type DeckFilters, deleteDeck, getDecks, isLiked, likeDeck, unlikeDeck, updateDeck } from './deckService'

export function useDecksSearch(filters: DeckFilters) {
  return useQuery({
    queryKey: ['decks', filters],
    queryFn: () => getDecks(filters),
    enabled: filters.page >= 0,
  })
}

export function useUpdateDeck() {
  const { data: user } = useUser()
  const email = user?.user.email
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deck: Deck) => {
      if (!email) {
        throw new Error('Email is required to update a deck')
      }
      return updateDeck({ ...deck, email })
    },
    onSuccess: (deck) => {
      queryClient.setQueryData(['deck', deck.id], deck)
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ['deck', deck.id] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}

export function useDeckLiked(id: number) {
  const { data: user } = useUser()
  return useQuery({
    queryKey: ['deck', id, 'liked', user?.user.email],
    queryFn: () => isLiked(id as number),
    enabled: !!user && !!user.user.email && id !== undefined,
  })
}

export function useLikeDeck(id: number) {
  const { data: user } = useUser()
  const email = user?.user.email
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (like: boolean) => {
      if (!email) {
        throw new Error('Email is required to like a deck')
      }
      if (like) {
        await likeDeck(email, id)
      } else {
        await unlikeDeck(email, id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck', id] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
