import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { DialogContext } from '@/context/DialogContext.ts'
import { supabase } from '@/lib/supabase.ts'
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
      await queryClient.invalidateQueries({ queryKey: ['user'] })
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

export function useVerifyOTP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        console.log('supabase OTP error', error)
        throw new Error('Error verifying the OTP')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
      await queryClient.invalidateQueries({ queryKey: ['collection'] })
      await queryClient.invalidateQueries({ queryKey: ['trade'] })
    },
  })
}

export async function signInWithOtp({ email }: { email: string }) {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    console.log('supabase sign in with OTP error', error)
    throw new Error('Error sending the OTP')
  }
}

export function useLoginDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useLoginDialog must be used within a ProfileDialogProvider')
  }
  return context
}
