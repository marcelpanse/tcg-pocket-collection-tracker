import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Deck } from '@/types'
import { userQuery } from '../auth/useAuth'
import { useCollection } from '../collection/useCollection'
import { type DeckFilters, deleteDeck, getAllPublicDecks, getDecks, isLiked, likeDeck, selectBuildableDecks, unlikeDeck, updateDeck } from './deckService'

export function useDecksSearch(filters: DeckFilters) {
  const { data: user } = useQuery(userQuery)
  const { data: collection } = useCollection()
  const buildable = filters.from === 'community' && filters.buildable

  const serverSide = useQuery({
    queryKey: ['decks', filters, user?.user.email],
    queryFn: () => getDecks(filters),
    enabled: filters.page >= 0 && !buildable,
  })

  // Every public deck, fetched once and shared across pages, orderings and energy filters.
  const allDecks = useQuery({
    queryKey: ['decks', 'all-public'],
    queryFn: getAllPublicDecks,
    enabled: buildable && !!collection,
    staleTime: 5 * 60 * 1000,
  })
  const page = useMemo(
    () => (allDecks.data && collection ? selectBuildableDecks(allDecks.data, filters, collection) : undefined),
    [allDecks.data, collection, filters],
  )

  return buildable ? { ...allDecks, data: page, isLoading: allDecks.isLoading || !page } : serverSide
}

export function useUpdateDeck() {
  const { data: user } = useQuery(userQuery)
  const email = user?.user.email
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deck: Omit<Deck, 'updated_at'>) => {
      if (!email) {
        throw new Error('Email is required to update a deck')
      }
      return updateDeck({ ...deck, email, updated_at: new Date() })
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
  const { data: user } = useQuery(userQuery)
  return useQuery({
    queryKey: ['deck', id, 'liked', user?.user.email],
    queryFn: () => isLiked(id as number),
    enabled: !!user && !!user.user.email && id !== undefined,
  })
}

export function useLikeDeck(id: number) {
  const { data: user } = useQuery(userQuery)
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
