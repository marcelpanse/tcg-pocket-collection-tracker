import { supabase } from '@/lib/supabase'
import type { Deck } from '@/types'

export async function getDeck(id: number) {
  const [personal, community] = await Promise.all([
    supabase.from('decks').select('*').eq('id', id).maybeSingle(),
    supabase.from('public_decks').select('*').eq('id', id).maybeSingle(),
  ])
  let ret = {}
  if (!community.error && !!community.data) {
    ret = { ...ret, ...community.data, is_public: true }
  }
  if (!personal.error && !!personal.data) {
    ret = { ...ret, ...personal.data }
  }
  if (Object.keys(ret).length > 0) {
    // some query succeded
    return ret as Deck
  }
  console.error('supabase error?', personal.error, community.error)
  throw new Error('Failed fetching deck')
}

export async function getMyDecks() {
  const { data, error } = await supabase.from('decks').select('*')
  if (error) {
    console.error('supabase error', error)
    throw new Error('Failed fetching user decks')
  }
  return data as Deck[]
}

export async function getLikedDecks() {
  const { data, error } = await supabase.from('deck_likes').select('*, public_decks!id(*)')
  if (error) {
    throw new Error(`Failed fetching liked decks: ${error.message}`)
  }
  const res = data.map((x) => ({ ...x.public_decks, is_public: true }))
  console.warn(res)
  return res as Deck[]
}

export async function getPublicDecks(page: number) {
  const pageSize = 25
  const { data, error } = await supabase
    .from('public_decks')
    .select('*')
    .order('likes', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)
  if (error) {
    throw new Error(`Failed fetching public decks: ${error.message}`)
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

export async function isLiked(id: number) {
  const { data, error } = await supabase.from('deck_likes').select('*').eq('id', id).maybeSingle()
  if (error) {
    throw new Error(`Failed getting deck liked status: ${error.message}`)
  }
  return Boolean(data)
}

export async function likeDeck(email: string, id: number) {
  const { error } = await supabase.from('deck_likes').insert({ email, id })
  if (error) {
    throw new Error(`Failed liking deck: ${error.message}`)
  }
}

export async function unlikeDeck(email: string, id: number) {
  const { error } = await supabase.from('deck_likes').delete().eq('email', email).eq('id', id)
  if (error) {
    throw new Error(`Failed unliking deck: ${error.message}`)
  }
}
