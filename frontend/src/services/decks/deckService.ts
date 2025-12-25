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
