import { createClient } from '@supabase/supabase-js'
import type { User } from '@/lib/context/UserContext.ts'

export const SUPABASE_URL = 'https://vcwloujmsjuacqpwthee.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2xvdWptc2p1YWNxcHd0aGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTM2NjAsImV4cCI6MjA1NzM4OTY2MH0.a4Hyi9PsyLQ-MxtS_20cSs4KWgDNh39w-uJo0cQa_qQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log('supa error', error)
    throw new Error('Error logging out')
  }

  console.log('logged out')
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
  console.log('supa sso response', data)
  window.location.href = data.redirectUrl
}
