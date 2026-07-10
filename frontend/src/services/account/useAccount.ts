import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { userQuery } from '@/services/auth/useAuth.ts'
import type { UserAccountRow } from '@/types'
import { getPublicAccount, getUserAccount, updateAccount, updateAccountTradingFields } from './accountService'

export function accountQuery(email: string | undefined) {
  return queryOptions({
    queryKey: ['account', email],
    queryFn: () => getUserAccount(email as string),
    enabled: !!email,
    throwOnError: true,
  })
}

export function useAccount() {
  const { data: user } = useQuery(userQuery)
  return useQuery(accountQuery(user?.user.email))
}

export function publicAccountQuery(friendId: string | undefined) {
  return queryOptions({
    queryKey: ['account', friendId],
    queryFn: () => getPublicAccount(friendId as string),
    enabled: !!friendId,
    throwOnError: true,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(['account', updatedAccount.email], updatedAccount)
    },
  })
}

export function useUpdateAccountTradingFields() {
  const queryClient = useQueryClient()
  const { data: user } = useQuery(userQuery)
  const email = user?.user.email

  return useMutation({
    mutationFn: ({
      username,
      is_active_trading,
      language,
      trade_rarity_settings,
    }: {
      username: string
      is_active_trading: boolean
      language: UserAccountRow['language']
      trade_rarity_settings: UserAccountRow['trade_rarity_settings']
    }) => {
      if (!email) {
        throw new Error('Email is required to update account')
      }
      if (!username) {
        throw new Error('Username is required to update account')
      }

      return updateAccountTradingFields({
        email,
        username,
        is_active_trading,
        language,
        trade_rarity_settings,
      })
    },
    onSuccess: (updatedAccount) => {
      queryClient.invalidateQueries({ queryKey: ['trading-partners'] })
      queryClient.setQueryData(['account', updatedAccount.email], updatedAccount)
    },
  })
}

export function useProfileDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useProfileDialog must be used within a ProfileDialogProvider')
  }
  return context
}
