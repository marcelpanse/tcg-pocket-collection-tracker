import { createClient } from '@supabase/supabase-js'

export const DATABASE_ID = '679f7ce60013c742add3'
export const COLLECTION_ID = '679f7cf50003d1a172c5'
export const ACCOUNTS_ID = '67b1e20b0032c6efb057'
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

export const authSSO = async (sso: string, sig: string) => {
  console.log('Temporarily disabled', sso, sig)
  // const response = await functions.createExecution('67ba4433001821690693', JSON.stringify({ sso, sig }))
  // window.location.href = JSON.parse(response.responseBody).redirectUrl
}
