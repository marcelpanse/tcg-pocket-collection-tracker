import { supabase } from '@/lib/Auth.ts'
import type { AccountRow } from '@/types'

export async function fetchAccount(email: string) {
  const { data, error } = await supabase.from('accounts').select().eq('email', email).limit(1)
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched account', data)

  if (data.length > 0) {
    return data[0] as AccountRow
  }
  return null
}

export async function fetchPublicAccount(friendId: string) {
  const { data, error } = await supabase.from('public_accounts').select().eq('friend_id', friendId).limit(1)
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched account', data)

  if (data.length > 0) {
    return data[0] as AccountRow
  }
  return null
}
