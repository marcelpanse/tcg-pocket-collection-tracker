import { supabase } from '@/lib/supabase'
import type { Deck, Energy } from '@/types'

export const deckKinds = ['my', 'liked', 'community'] as const

export interface DeckFilters {
  kind: (typeof deckKinds)[number]
  page: number
  energy: Energy[]
}
const pageSize = 25

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

export async function getDecks(filters: DeckFilters) {
  // biome-ignore lint: supabase query builder is hard to type
  let tbl: any = supabase

  if (filters.kind === 'my') {
    tbl = tbl.from('decks').select('*')
  } else if (filters.kind === 'liked') {
    tbl = tbl.from('deck_likes').select('*, public_decks!id(*)')
  } else if (filters.kind === 'community') {
    tbl = tbl.from('public_decks').select('*').order('likes', { ascending: false })
  }

  const col_prefix = filters.kind === 'liked' ? 'public_decks.' : ''

  if (filters.energy.length > 0) {
    tbl = tbl.contains(`${col_prefix}energy`, filters.energy)
  }

  const { data, error } = await tbl.range(filters.page * pageSize, (filters.page + 1) * pageSize - 1)
  if (error) {
    throw new Error(`Failed fetching decks: ${error.message}`)
  }

  if (filters.kind === 'liked') {
    // biome-ignore lint: joins are hard to type
    return data.map((row: any) => ({ ...row.public_decks, is_public: true })) as Deck[]
  } else {
    return data as Deck[]
  }
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
