import { supabase } from '@/lib/supabase'
import { type PublicAccountRow, tradableRarities, type UserAccountRow } from '@/types'

function transformUserAccount(account: UserAccountRow) {
  account.collection_last_updated = new Date(account.collection_last_updated)
  account.last_active = new Date(account.last_active)

  for (const rarity of tradableRarities) {
    // set default values for each rarity that we don't have a setting for yet.
    if (!account.trade_rarity_settings.find((r) => r.rarity === rarity)) {
      account.trade_rarity_settings.push({ rarity, to_collect: 1, to_keep: 1 })
    }
  }

  return account as UserAccountRow
}

export const getUserAccount = async (email: string) => {
  if (!email) {
    throw new Error('Email is required to fetch account')
  }

  const { data, error } = await supabase.from('accounts').select('*, trade_rarity_settings:trade_rarity_settings!email(*)').eq('email', email).maybeSingle()
  if (error) {
    throw new Error(`Error fetching account: ${error.message}`)
  }

  if (data) {
    return transformUserAccount(data as UserAccountRow)
  }

  // no account exists yet, create one
  return transformUserAccount(
    await updateAccount({
      email,
      username: null,
    } as UserAccountRow),
  )
}

export const getPublicAccount = async (friendId: string) => {
  if (!friendId) {
    throw new Error('Friend ID is required to fetch public account')
  }

  const { data, error } = await supabase.from('public_accounts').select().eq('friend_id', friendId).maybeSingle()

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched public account', data)

  if (data) {
    return data as PublicAccountRow
  }

  return null
}

export const updateAccount = async (account: UserAccountRow) => {
  if (!account.email) {
    throw new Error('Email is required to update account')
  }
  const { data, error } = await supabase
    .from('accounts')
    .upsert({ ...account, trade_rarity_settings: undefined })
    .select('*, trade_rarity_settings:trade_rarity_settings!email(*)')
    .single()

  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  return transformUserAccount(data as UserAccountRow)
}

export const updateAccountTradingFields = async ({
  email,
  username,
  is_active_trading,
  language,
  trade_rarity_settings,
}: {
  email: string
  username: string
  is_active_trading: boolean
  language: UserAccountRow['language']
  trade_rarity_settings: UserAccountRow['trade_rarity_settings']
}) => {
  const { error: rarityError } = await supabase
    .from('trade_rarity_settings')
    .upsert(trade_rarity_settings?.map((r) => ({ email, ...r })) ?? [])
    .select()

  if (rarityError) {
    throw new Error(`Error updating trade rarity settings: ${rarityError.message}`)
  }

  const { data, error } = await supabase
    .from('accounts')
    .upsert({ email, username, is_active_trading, language: language })
    .select('*, trade_rarity_settings:trade_rarity_settings!email(*)')
    .single()

  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  console.log('updated account', data)
  return transformUserAccount(data as UserAccountRow)
}

export async function updateCollectionTimestamp(email: string, now: Date) {
  const { error, data } = await supabase
    .from('accounts')
    .update({ collection_last_updated: now })
    .eq('email', email)
    .select('*, trade_rarity_settings:trade_rarity_settings!email(*)')
    .single()
  if (error) {
    throw new Error(`Failed updating account: ${error.message}`)
  }
  return transformUserAccount(data as UserAccountRow)
}
