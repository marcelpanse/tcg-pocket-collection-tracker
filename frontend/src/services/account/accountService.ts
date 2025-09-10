import { supabase } from '@/lib/supabase'
import type { AccountRow } from '@/types'

export const getAccount = async (email: string) => {
  if (!email) {
    throw new Error('Email is required to fetch account')
  }

  const { data, error } = await supabase.from('accounts').select().eq('email', email).limit(1)

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched account', data)

  if (data.length > 0) {
    data[0].collection_last_updated = new Date(data[0].collection_last_updated)
    return data[0] as AccountRow
  }

  // Default values if no account exists
  return {
    email,
    username: '',
    min_number_of_cards_to_keep: 1,
    max_number_of_cards_wanted: 1,
  } as AccountRow & { email: string }
}

export const getPublicAccount = async (friendId: string) => {
  if (!friendId) {
    throw new Error('Friend ID is required to fetch public account')
  }

  const { data, error } = await supabase.from('public_accounts').select().eq('friend_id', friendId).limit(1)

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched public account', data)

  if (data.length > 0) {
    return data[0] as AccountRow
  }

  return null
}

export const updateAccount = async (account: AccountRow) => {
  if (!account.email) {
    throw new Error('Email is required to update account')
  }

  const { data, error } = await supabase.from('accounts').upsert(account).select().single()

  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  return data as AccountRow
}

export const updateAccountTradingFields = async ({
  email,
  username,
  is_active_trading,
  min_number_of_cards_to_keep,
  max_number_of_cards_wanted,
}: {
  email: string
  username: string
  is_active_trading: boolean
  min_number_of_cards_to_keep: number
  max_number_of_cards_wanted: number
}) => {
  const { data, error } = await supabase
    .from('accounts')
    .upsert({ email, username, is_active_trading, min_number_of_cards_to_keep, max_number_of_cards_wanted })
    .select()
    .single()
  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  return data as AccountRow
}
