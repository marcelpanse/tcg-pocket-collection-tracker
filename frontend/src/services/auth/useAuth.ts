import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { pb } from '@/lib/pocketbase'
import { authSSO, getCurrentUser, logout } from '@/services/auth/authService.ts'
import { removeLocalCacheItems } from '@/services/collection/collectionService.ts'
import type { User } from '@/types'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: Infinity, // User data doesn't change without explicit action
  })
}

export function useLogout() {
  const { data: user } = useUser()
  const email = user?.email
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(['user'], null)
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
      await queryClient.invalidateQueries({ queryKey: ['collection'] })
      await queryClient.invalidateQueries({ queryKey: ['trades'] })
      if (email) {
        removeLocalCacheItems(email)
      }
    },
  })
}

export function useAuthSSO() {
  return useMutation({
    mutationFn: ({ user, sso, sig }: { user: User; sso: string; sig: string }) => authSSO(user, sso, sig),
    onSuccess: (data) => {
      console.log('on success sso')
      window.location.href = data.redirectUrl
    },
  })
}

export function loginWithPassword({ email, password }: { email: string; password: string }) {
  return pb.collection('users').authWithPassword(email, password)
}

export function register({ email, password }: { email: string; password: string }) {
  return pb.collection('users').create({ email, password, passwordConfirm: password })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginWithPassword,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
      await queryClient.invalidateQueries({ queryKey: ['collection'] })
      await queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  })
}

export function useLoginDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useLoginDialog must be used within a ProfileDialogProvider')
  }
  return context
}
