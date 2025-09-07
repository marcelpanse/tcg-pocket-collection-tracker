import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error('Failed to get user session')
  }
  return data.session
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error('Error logging out')
  }
}

export const authSSO = async (user: User, sso: string, sig: string) => {
  console.log('Initializing SSO for discourse', sso, sig)

  const authToken = user.access_token
  const { data, error } = await supabase.functions.invoke('sso', {
    method: 'POST',
    body: { sso, sig },
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })

  if (error) {
    console.log('supa sso error', error)
    throw new Error('Error logging in')
  }

  return data
}
