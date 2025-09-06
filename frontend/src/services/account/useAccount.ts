import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import type { AccountRow } from '@/types'
import { accountService } from './accountService'

export function useAccount() {
  const { data: user } = useUser()
  const email = user?.user.email

  return useQuery({
    queryKey: ['account', email],
    queryFn: () => accountService.fetchAccount(email || ''),
    enabled: !!email,
  })
}

export function usePublicAccount(friendId: string | undefined) {
  return useQuery({
    queryKey: ['account', friendId],
    queryFn: () => accountService.fetchPublicAccount(friendId || ''),
    enabled: !!friendId,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (account: AccountRow) => accountService.updateAccount(account),
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
