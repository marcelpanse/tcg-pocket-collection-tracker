import { supabase } from '@/lib/supabase'
import { getDeckCardCounts, getMissingCardsCount } from '@/pages/decks/utils'
import type { Collection, Deck, Energy } from '@/types'

export const deckKinds = ['community', 'liked', 'my'] as const
export const deckOrder = ['popular', 'new'] as const

export interface DeckFilters {
  from: (typeof deckKinds)[number]
  orderby: (typeof deckOrder)[number]
  page: number
  energy: Energy[]
  buildable: boolean
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
  // biome-ignore lint: enable dynamic properties
  let res: any = {}
  if (!popular.error && popular.data) {
    res = { ...res, ...popular.data, is_public: true }
  }
  if (!personal.error && personal.data) {
    res = { ...res, ...personal.data }
  }
  if (Object.keys(res).length > 0) {
    console.log('dupa', res)
    // at least one query succeeded
    return { ...res, created_at: new Date(res.created_at), updated_at: new Date(res.updated_at) } as Deck
  }
  console.error('supabase error?', personal.error, popular.error)
  throw new Error('Failed fetching deck')
}

const pageSize = 25
export async function getDecks(filters: DeckFilters) {
  // biome-ignore lint: supabase query builder is hard to type
  let tbl: any = supabase

  if (filters.from === 'my') {
    tbl = tbl.from('decks').select('*', { count: 'exact' }).order('updated_at', { ascending: false })
  } else if (filters.from === 'liked') {
    tbl = tbl.from('deck_likes').select('*, public_decks!id(*)', { count: 'exact' }).order('created_at', { ascending: false })
  } else if (filters.from === 'community') {
    tbl = supabase.from('public_decks').select('*', { count: 'exact' })
    if (filters.orderby === 'popular') {
      tbl = tbl.order('likes', { ascending: false })
    } else if (filters.orderby === 'new') {
      tbl = tbl.order('created_at', { ascending: false })
    }
    tbl = tbl.order('id', { ascending: false })
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
  decks = decks.map((x) => ({ ...x, created_at: new Date(x.created_at), updated_at: new Date(x.updated_at) }))
  return { decks, count, hasNext: (filters.page + 1) * pageSize < count }
}

/* The "decks I can build" filter is evaluated client-side: the predicate needs the user's full collection plus the
   alternate_versions groups from cards.json, both of which only exist in the browser. So we pull every public deck
   once (~300B per row) and filter, sort and paginate locally. This keeps a single source of truth for "is this deck
   buildable" (getMissingCardsCount, also used by DeckView) and needs no per-user aggregate in the database. */
const fetchChunk = 1000
export async function getAllPublicDecks() {
  const decks: Deck[] = []
  for (let from = 0; ; from += fetchChunk) {
    const { data, error } = await supabase
      .from('public_decks')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + fetchChunk - 1)
    if (error) {
      throw new Error(`Failed fetching decks: ${error.message}`)
    }
    decks.push(...(data as Deck[]).map((x) => ({ ...x, created_at: new Date(x.created_at), updated_at: new Date(x.updated_at) })))
    if (data.length < fetchChunk) {
      return decks
    }
  }
}

export function selectBuildableDecks(allDecks: Deck[], filters: DeckFilters, collection: Collection) {
  const matches = allDecks
    // `contains` semantics: a deck matches when it has every selected energy.
    .filter((deck) => deck.cards.length > 0 && filters.energy.every((energy) => deck.energy.includes(energy)))
    .filter((deck) => getMissingCardsCount(getDeckCardCounts(deck.cards), collection) === 0)
    .toSorted((a, b) =>
      filters.orderby === 'popular'
        ? (b.likes ?? 0) - (a.likes ?? 0) || (b.id ?? 0) - (a.id ?? 0)
        : b.created_at.getTime() - a.created_at.getTime() || (b.id ?? 0) - (a.id ?? 0),
    )
  return {
    decks: matches.slice(filters.page * pageSize, (filters.page + 1) * pageSize),
    count: matches.length,
    hasNext: (filters.page + 1) * pageSize < matches.length,
  }
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
  return { ...data, updated_at: new Date(data.updated_at) } as Deck
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
