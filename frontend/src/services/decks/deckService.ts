import { supabase } from '@/lib/supabase'
import type { Deck } from '@/types'

export async function getDeck(id: number) {
  const { data, error } = await supabase.from('decks').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed fetching decks')
  }
  if (!data) {
    console.error('dupa')
    throw new Error('No deck with such id')
  }
  console.log('successfully fetched deck', data)
  return data as Deck
}

export async function getMyDecks() {
  const { data, error } = await supabase.from('decks').select('*')
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed fetching user decks')
  }
  return data as Deck[]
}

export async function getPublicDecks(page: number) {
  const pageSize = 25
  console.warn(page)
  const { data, error } = await supabase
    .from('public_decks')
    .select('*')
    .range(page * pageSize, (page + 1) * pageSize - 1)
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed fetching public decks')
  }
  return data.map((x) => ({ ...x, is_public: true })) as Deck[]
}

export async function updateDeck(deck: Deck) {
  const { data, error } = await supabase.from('decks').upsert(deck).select().single()
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed updating decks')
  }
  return data as Deck
}

export async function deleteDeck(id: number) {
  const { data, error } = await supabase.from('decks').delete().eq('id', id).select().single()
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed updating decks')
  }
  return data as Deck
}
