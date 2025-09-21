import { supabase } from '@/lib/supabase.ts'
import type { TradePartners, TradeRow } from '@/types'

export const getTrades = async () => {
  const { data, error } = await supabase.from('trades').select().limit(20).order('updated_at', { ascending: false })

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching trades')
  }

  console.log('fetched trades', data)

  return data as TradeRow[]
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

export const getTradingPartners = async (email: string, maxNumberOfCardsWanted: number, minNumberOfCardsToKeep: number) => {
  const { data, error } = await supabase.functions.invoke('get-trading-partners', {
    method: 'POST',
    body: { email, maxNumberOfCardsWanted, minNumberOfCardsToKeep },
  })
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching trade partners')
  }

  console.log('fetched trade partners', data)

  return data as TradePartners[]
}
