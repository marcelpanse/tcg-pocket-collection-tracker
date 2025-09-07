import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { authSSO, getCurrentUser, logout } from '@/services/auth/authService.ts'
import type { User } from '@/types'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: Infinity, // User data doesn't change without explicit action
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(['user'], null)
      await queryClient.invalidateQueries({ queryKey: ['account'] })
      await queryClient.invalidateQueries({ queryKey: ['collection'] })
      await queryClient.invalidateQueries({ queryKey: ['trade'] })
    },
  })
}

export function useAuthSSO() {
  return useMutation({
    mutationFn: ({ user, sso, sig }: { user: User; sso: string; sig: string }) => authSSO(user, sso, sig),
    onSuccess: (data) => {
      window.location.href = data.redirectUrl
    },
  })
}

export function useLoginDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useLoginDialog must be used within a ProfileDialogProvider')
  }
  return context
}
