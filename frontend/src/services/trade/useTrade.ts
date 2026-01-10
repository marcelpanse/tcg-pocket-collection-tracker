import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCardByInternalId } from '@/lib/CardsDB'
import { supabase } from '@/lib/supabase'
import { useAccount } from '@/services/account/useAccount.ts'
import { getActiveTrades, getTradingPartners, insertTrade, updateTrade } from '@/services/trade/tradeService.ts'
import type { TradeRow } from '@/types'

export function useActiveTrades() {
  const { data: account } = useAccount()
  const friendId = account?.friend_id
  return useQuery({
    queryKey: ['trades'],
    queryFn: () => getActiveTrades(friendId as string),
    enabled: Boolean(friendId),
    throwOnError: true,
  })
}

export function useTradingPartners(cardId: number | undefined) {
  const { data: account } = useAccount()
  return useQuery({
    queryKey: ['trading-partners', cardId],
    queryFn: () => getTradingPartners(account?.email as string, cardId),
    enabled: !!account && (cardId === undefined || getCardByInternalId(cardId) !== undefined),
    throwOnError: true,
  })
}

// MUTATIONS

export function useInsertTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (trade: TradeRow) => insertTrade(trade),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useUpdateTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, trade }: { id: number; trade: Partial<TradeRow> }) => updateTrade(id, trade),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useActionableTradeCount() {
  const { data: account } = useAccount()

  return useQuery({
    queryKey: ['trades', 'new'],
    queryFn: async () => {
      if (!account) {
        throw new Error('Account is needed to fetch new trades')
      }
      const { count, error } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'offered')
        .eq('receiving_friend_id', account?.friend_id)
      if (error) {
        console.log('supabase error', error)
        throw new Error('Failed fetching new trades')
      }
      return count as number
    },
    enabled: Boolean(account?.friend_id),
  })
}
