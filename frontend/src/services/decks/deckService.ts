import { supabase } from '@/lib/supabase'
import type { Deck, Energy } from '@/types'

export const deckKinds = ['community', 'liked', 'my'] as const
export const deckOrder = ['popular', 'new'] as const

export interface DeckFilters {
  from: (typeof deckKinds)[number]
  orderby: (typeof deckOrder)[number]
  page: number
  energy: Energy[]
}

export async function getDeck(id: number) {
  /* This function might look weird, but there are two reasons why it's like this:
  1. We want to support the path `/decks/:id` for both private and public decks, and we can't deduce which one it is beforehand.
  2. Public decks have column `likes`, which private decks don't, and private decks have column `email` which public decks don't.
     So to have both columns for a user looking at his public deck, we need to merge the results.
  */
  const [personal, popular] = await Promise.all([
    supabase.from('decks').select('*').eq('id', id).maybeSingle(),
    supabase.from('public_decks').select('*').eq('id', id).maybeSingle(),
  ])
  let res = {}
  if (!popular.error && !!popular.data) {
    res = { ...res, ...popular.data, is_public: true }
  }
  if (!personal.error && !!personal.data) {
    res = { ...res, ...personal.data }
  }
  if (Object.keys(res).length > 0) {
    // at least one query succeeded
    return res as Deck
  }
  console.error('supabase error?', personal.error, popular.error)
  throw new Error('Failed fetching deck')
}

const pageSize = 25
export async function getDecks(filters: DeckFilters) {
  // biome-ignore lint: supabase query builder is hard to type
  let tbl: any = supabase

  if (filters.from === 'my') {
    tbl = tbl.from('decks').select('*', { count: 'exact' })
  } else if (filters.from === 'liked') {
    tbl = tbl.from('deck_likes').select('*, public_decks!id(*)', { count: 'exact' })
  } else if (filters.from === 'community') {
    tbl = tbl.from('public_decks').select('*', { count: 'exact' })
    if (filters.orderby === 'popular') {
      tbl = tbl.order('likes', { ascending: false })
    } else if (filters.orderby === 'new') {
      tbl = tbl.order('created_at', { ascending: false })
    }
  }

  const col_prefix = filters.from === 'liked' ? 'public_decks.' : ''

  if (filters.energy.length > 0) {
    tbl = tbl.contains(`${col_prefix}energy`, filters.energy)
  }

  const { data, count, error } = await tbl.range(filters.page * pageSize, (filters.page + 1) * pageSize - 1)
  if (error) {
    throw new Error(`Failed fetching decks: ${error.message}`)
  }

  let decks: Deck[]
  if (filters.from === 'liked') {
    // biome-ignore lint: joins are hard to type
    decks = data.map((row: any) => ({ ...row.public_decks, is_public: true })) as Deck[]
  } else {
    decks = data as Deck[]
  }
  return { decks, count, hasNext: (filters.page + 1) * pageSize < count }
}

export async function updateDeck(deck: Deck) {
  const now = new Date()
  const nowString = now.toISOString()

  const { data, error } = await supabase
    .from('decks')
    .upsert({ ...deck, updated_at: nowString, likes: undefined })
    .select()
    .single()
  if (error) {
    throw new Error(`Failed updating decks: ${error.message}`)
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
