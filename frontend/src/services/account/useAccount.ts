import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import type { AccountRow } from '@/types'
import { getAccount, getPublicAccount, updateAccount, updateAccountTradingFields } from './accountService'

export function useAccount() {
  const { data: user } = useUser()
  const email = user?.user.email

  return useQuery({
    queryKey: ['account', email],
    queryFn: () => getAccount(email as string),
    enabled: !!email,
  })
}

export function usePublicAccount(friendId: string | undefined) {
  return useQuery({
    queryKey: ['account', friendId],
    queryFn: () => getPublicAccount(friendId as string),
    enabled: !!friendId,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (account: AccountRow) => updateAccount(account),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(['account', updatedAccount.email], updatedAccount)
    },
  })
}

export function useUpdateAccountTradingFields() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()
  const email = user?.user.email

  return useMutation({
    mutationFn: ({
      username,
      is_active_trading,
      min_number_of_cards_to_keep,
      max_number_of_cards_wanted,
    }: {
      username: string
      is_active_trading: boolean
      min_number_of_cards_to_keep: number
      max_number_of_cards_wanted: number
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
        min_number_of_cards_to_keep,
        max_number_of_cards_wanted,
      })
    },
    onSuccess: (updatedAccount) => {
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
