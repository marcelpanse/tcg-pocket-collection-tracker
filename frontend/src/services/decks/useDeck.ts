import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Deck } from '@/types'
import { useUser } from '../auth/useAuth'
import { deleteDeck, getDeck, getMyDecks, getPublicDecks, updateDeck } from './deckService'

export function useDeck(id?: number) {
  return useQuery({
    queryKey: ['deck', id],
    queryFn: () => getDeck(id as number),
    enabled: id !== undefined,
  })
}

export function useMyDecks() {
  const { data: user } = useUser()
  return useQuery({
    queryKey: ['decks', 'my'],
    queryFn: () => getMyDecks(),
    enabled: !!user && !!user.user.email,
  })
}

export function usePublicDecks(page: number) {
  return useQuery({
    queryKey: ['decks', 'public', page],
    queryFn: () => getPublicDecks(page),
    enabled: page >= 0,
  })
}

export function useUpdateDeck() {
  const { data: user } = useUser()
  const email = user?.user.email
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deck: Deck) => {
      if (!email) {
        throw new Error('Email is required to update deck')
      }
      return updateDeck({ ...deck, email })
    },
    onSuccess: (deck) => {
      queryClient.setQueryData(['deck', deck.id], deck)
      queryClient.invalidateQueries({ queryKey: ['decks', 'my'] }) // TODO: update it instead
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ['deck', deck.id] })
      queryClient.invalidateQueries({ queryKey: ['decks', 'my'] }) // TODO: update it instead
    },
  })
}
