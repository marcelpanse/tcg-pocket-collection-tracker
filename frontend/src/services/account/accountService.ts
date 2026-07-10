import { supabase } from '@/lib/supabase'
import { type PublicAccountRow, tradableRarities, type UserAccountRow } from '@/types'

export const getUserAccount = async (email: string) => {
  if (!email) {
    throw new Error('Email is required to fetch account')
  }

  const { data, error } = await supabase.from('accounts').select('*, trade_rarity_settings:trade_rarity_settings!email(*)').eq('email', email).maybeSingle()

  if (error) {
    throw new Error(`Error fetching account: ${error.message}`)
  }

  if (data) {
    const accountRow = data as UserAccountRow

    for (const rarity of tradableRarities) {
      //set default values for each rarity that we don't have a setting for yet.
      if (!accountRow.trade_rarity_settings.find((r) => r.rarity === rarity)) {
        accountRow.trade_rarity_settings.push({ rarity, to_collect: 1, to_keep: 1 })
      }
    }

    return accountRow
  }

  // no account exists yet, create one
  return await updateAccount({
    email,
    username: null,
  } as UserAccountRow)
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
    .upsert(account)
    .eq('email', account.email)
    .select('*, trade_rarity_settings:trade_rarity_settings!email(*)')
    .single()

  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  return data as UserAccountRow
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
  return data as UserAccountRow
}
