import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount } from '@/services/account/useAccount.ts'
import { getTrades, insertTrade, updateTrade } from '@/services/trade/tradeService.ts'
import type { TradeRow } from '@/types'

export function useTrades() {
  return useQuery({
    queryKey: ['trade'],
    queryFn: getTrades,
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
      await queryClient.invalidateQueries({ queryKey: ['actionableTradeCount'] })
    },
  })
}

export function useActionableTradeCount() {
  const { data: trades } = useTrades()
  const { data: account } = useAccount()

  return useQuery({
    queryKey: ['actionableTradeCount', trades, account?.friend_id],
    queryFn: () => {
      console.log('openTrades', trades, account)
      if (!account || !trades) {
        console.log('no account or trades')
        return 0
      }

      // trades where i'm the receiver but didn't accept/decline yet
      const sentTrades = trades?.filter((t) => t.receiving_friend_id === account?.friend_id && t.status === 'offered')
      console.log('sentTrades', sentTrades)

      const nonCompletedTrades = trades?.filter((t) => {
        if (t.status !== 'finished') {
          return false //trade marked as completed
        }

        if (t.offering_friend_id === account?.friend_id && t.offerer_ended) {
          return false //I initiated and also ended
        }
        if (t.receiving_friend_id === account?.friend_id && t.receiver_ended) {
          return false //I received and also ended
        }

        if (!sentTrades?.includes(t)) {
          return false //already counted in the sentTrades array, so don't count twice
        }

        return true
      })

      console.log('nonCompletedTrades', nonCompletedTrades)

      return sentTrades?.length + nonCompletedTrades?.length
    },
  })
}
