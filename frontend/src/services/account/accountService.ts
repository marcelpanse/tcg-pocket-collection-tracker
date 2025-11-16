import { supabase } from '@/lib/supabase'
import { type AccountRow, tradableRarities } from '@/types'

export const getAccount = async (email: string) => {
  if (!email) {
    throw new Error('Email is required to fetch account')
  }

  const { data, error } = await supabase
    .from('accounts')
    .select(`
    *,
    trade_rarity_settings:trade_rarity_settings!email(*)
  `)
    .eq('email', email)
    .single()

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching account')
  }

  console.log('fetched account', data)

  if (data) {
    const accountRow = data as AccountRow

    for (const rarity of tradableRarities) {
      //set default values for each rarity that we don't have a setting for yet.
      if (!accountRow.trade_rarity_settings.find((r) => r.rarity === rarity)) {
        accountRow.trade_rarity_settings.push({
          rarity,
          to_collect: accountRow.max_number_of_cards_wanted || 1,
          to_keep: accountRow.min_number_of_cards_to_keep || 1,
        })
      }
    }

    console.log('returning account', accountRow)
    return accountRow
  }

  // no account exists yet, create one
  return await updateAccount({
    email,
    username: '',
  } as AccountRow)
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
    // TESTING
    data[0].trade_rarity_settings = [
      { rarity: '◊', to_collect: '2', to_keep: '2' },
      { rarity: '◊◊', to_collect: '2', to_keep: '2' },
    ]
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
  trade_rarity_settings,
}: {
  email: string
  username: string
  is_active_trading: boolean
  min_number_of_cards_to_keep: number
  max_number_of_cards_wanted: number
  trade_rarity_settings: AccountRow['trade_rarity_settings']
}) => {
  const { data: rarityData, error: rarityError } = await supabase
    .from('trade_rarity_settings')
    .upsert(trade_rarity_settings.map((r) => ({ email, ...r })))
    .select()

  if (rarityError) {
    throw new Error(`Error updating trade rarity settings: ${rarityError.message}`)
  }

  const { data, error } = await supabase
    .from('accounts')
    .upsert({ email, username, is_active_trading, min_number_of_cards_to_keep, max_number_of_cards_wanted })
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating account: ${error.message}`)
  }

  data.trade_rarity_settings = rarityData

  console.log('updated account', data)
  return data as AccountRow
}
