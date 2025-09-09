import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTrades, insertTrade, updateTrade } from '@/services/trade/tradeService.ts'
import type { TradeRow } from '@/types'

export function useTrades() {
  return useQuery({
    queryKey: ['trade'],
    queryFn: fetchTrades,
  })
}

export function useInsertTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (trade: TradeRow) => insertTrade(trade),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trade'] })
    },
  })
}

export function useUpdateTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, trade }: { id: number; trade: Partial<TradeRow> }) => updateTrade(id, trade),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trade'] })
    },
  })
}
