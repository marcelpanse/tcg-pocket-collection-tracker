import { supabase } from '@/lib/supabase.ts'
import type { TradePartners, TradeRow } from '@/types'

export async function getActiveTrades(userFriendId: string) {
  if (!userFriendId.match(/^\d{16}$/)) {
    throw new Error('Error fetching active trades: Invalid friendId')
  }
  const { data, error } = await supabase
    .from('trades')
    .select()
    .or(`and(offering_friend_id.eq.${userFriendId},offerer_ended.eq.false),and(receiving_friend_id.eq.${userFriendId},receiver_ended.eq.false)`)

  if (error) {
    throw new Error(`Error fetching active trades: ${error.message}`)
  }

  return data.map((x) => ({ ...x, created_at: new Date(x.created_at), updated_at: new Date(x.updated_at) })) as TradeRow[]
}

export async function getAllTrades(friendId: string) {
  if (!friendId.match(/^\d{16}$/)) {
    throw new Error('Error fetching active trades: Invalid friendId')
  }
  const { data, error } = await supabase.from('trades').select().or(`offering_friend_id.eq.${friendId},receiving_friend_id.eq.${friendId}`)

  if (error) {
    throw new Error(`Error fetching active trades with ${friendId}: ${error.message}`)
  }

  return data.map((x) => ({ ...x, created_at: new Date(x.created_at), updated_at: new Date(x.updated_at) })) as TradeRow[]
}

export const insertTrade = async (trade: TradeRow) => {
  const { data, error } = await supabase.from('trades').insert(trade).select().single()

  if (error) {
    throw new Error(`Error inserting trade: ${error.message}`)
  }

  return data as TradeRow
}

export const updateTrade = async (id: number, trade: Partial<TradeRow>) => {
  const now = new Date()
  const { data, error } = await supabase
    .from('trades')
    .update({ ...trade, updated_at: now })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating trade: ${error.message}`)
  }

  return data as TradeRow
}

export const getTradingPartners = async (email: string, cardId?: number) => {
  const { data, error } = await supabase.functions.invoke('get-trading-partners', {
    method: 'POST',
    body: { email, card_id: cardId },
  })
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching trade partners')
  }

  console.log('fetched trade partners', data)

  return data as TradePartners[]
}
