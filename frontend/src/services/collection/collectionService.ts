import { supabase } from '@/lib/supabase'
import { chunk } from '@/lib/utils'
import type { CardAmountsRowUpdate, CardAmountUpdate, Collection, CollectionRow, UserAccountRow } from '@/types'
import { updateCollectionTimestamp } from '../account/accountService'

export interface CollectionRowUpdate {
  email: string
  internal_id: number
  updated_at: Date
  card_id: string
}

const COLLECTION_CACHE_KEY = 'tcg_collection_cache_v5'
const COLLECTION_TIMESTAMP_KEY = 'tcg_collection_timestamp_v5'
// Caches written by earlier versions may be partial: they were filled by an OFFSET-paginated fetch without an
// ORDER BY, which silently dropped rows. The v4 caches are keyed by internal_ids that predate the B4 rarity
// re-encoding. Bumping the key above forces a resync; these get purged to free up quota.
const STALE_CACHE_KEYS = [
  'tcg_collection_cache_v2',
  'tcg_collection_timestamp_v2',
  'tcg_collection_cache_v3',
  'tcg_collection_timestamp_v3',
  'tcg_collection_cache_v4',
  'tcg_collection_timestamp_v4',
]
const PAGE_SIZE = 500

export const removeLocalCacheItems = (email: string) => {
  // Invalidate local cache by removing records from localStorage
  localStorage.removeItem(`${COLLECTION_CACHE_KEY}_${email}`)
  localStorage.removeItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
}

const removeStaleCacheItems = (email: string) => {
  for (const key of STALE_CACHE_KEYS) {
    localStorage.removeItem(`${key}_${email}`)
  }
}

export async function getCollection(email: string, collectionLastUpdated?: Date): Promise<Collection> {
  if (!email) {
    throw new Error('Email is required to fetch collection')
  }

  removeStaleCacheItems(email)

  // Check if we should use cached data
  if (collectionLastUpdated) {
    const cachedCollection = getCollectionFromCache(email)
    const cacheLastUpdatedRaw = localStorage.getItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)

    if (cacheLastUpdatedRaw) {
      try {
        const cacheLastUpdated = new Date(cacheLastUpdatedRaw)

        if (cacheLastUpdated && !Number.isNaN(cacheLastUpdated.getTime()) && cacheLastUpdated >= collectionLastUpdated && cachedCollection !== null) {
          return cachedCollection
        }
      } catch (e) {
        console.log('Error parsing cache timestamp', e)
      }
    }
  }

  // Fetch from API if cache is invalid or not available
  const collection = await fetchCollectionFromAPI('card_amounts', 'email', email)

  if (collectionLastUpdated) {
    updateCollectionCache(collection, email, collectionLastUpdated)
  }

  return collection
}

export function getPublicCollection(friendId: string) {
  if (!friendId) {
    throw new Error('Friend ID is required to fetch public collection')
  }
  return fetchCollectionFromAPI('public_card_amounts_collection', 'friend_id', friendId)
}

export const updateCards = async (email: string, rowsToUpdate: CardAmountUpdate[], collection: Collection) => {
  if (!email) {
    throw new Error('Email is required to update cards')
  }
  if (!rowsToUpdate.length) {
    throw new Error('No card updates provided')
  }

  const now = new Date()

  // Update collection records
  const amountRows: CardAmountsRowUpdate[] = rowsToUpdate
    .map((row) => ({
      email,
      internal_id: row.internal_id,
      amount_owned: row.amount_owned,
      amount_wanted: collection.get(row.internal_id)?.amount_wanted ?? null,
      collected: row.collected,
      updated_at: now,
    }))
    // Deduplicate amountRows on internal_id, needed for card csv import feature
    .filter((row, index, self) => index === self.findIndex((r) => r.internal_id === row.internal_id))

  // Execute all three database calls in parallel
  let account: UserAccountRow
  try {
    const [accountResult, cardAmountsResult] = await Promise.all([updateCollectionTimestamp(email, now), supabase.from('card_amounts').upsert(amountRows)])

    if (cardAmountsResult.error) {
      throw new Error(`Error bulk updating card amounts: ${cardAmountsResult.error.message}`)
    }

    account = accountResult
  } catch (error) {
    removeLocalCacheItems(email)
    throw error
  }

  for (const row of rowsToUpdate) {
    // for each card that has updated, we need to find the matching internal card in the cache by internal_id and update it.
    const existing = collection.get(row.internal_id)
    if (existing) {
      const { internal_id, ...data } = row
      Object.assign(existing, data)
      existing.updated_at = now
    } else {
      // the card is not yet in the cache, so we need to add it.
      collection.set(row.internal_id, {
        email,
        internal_id: row.internal_id,
        amount_owned: row.amount_owned ?? 0,
        amount_wanted: null,
        created_at: now,
        updated_at: now,
        collected: row.collected,
      })
    }
  }

  updateCollectionCache(collection, email, now)

  return {
    cards: collection,
    account: account as UserAccountRow,
  }
}

export async function updateAmountWanted(
  email: string,
  collection: Collection,
  internal_id: number,
  amount_wanted: number | null,
  updated_at: Date,
  do_insert?: boolean,
) {
  if (do_insert) {
    const { error } = await supabase.from('card_amounts').insert({ email, internal_id })
    if (error) {
      // Do not hard fail, as it might be a second request in a row
      console.warn(`Failed insering a new card_amounts row: ${error.message}`)
    }
  }
  const { error } = await supabase.from('card_amounts').update({ amount_wanted, updated_at }).eq('email', email).eq('internal_id', internal_id)
  if (error) {
    throw new Error(`Failed updating amount_wanted: ${error.message}`)
  }

  const existing = collection.get(internal_id)

  if (existing) {
    existing.amount_wanted = amount_wanted
    existing.updated_at = updated_at
  } else {
    collection.set(internal_id, {
      email,
      internal_id,
      amount_owned: 0,
      amount_wanted: amount_wanted,
      created_at: updated_at,
      updated_at: updated_at,
      collected: false,
    })
  }

  updateCollectionCache(collection, email, updated_at)

  return collection
}

export const setCollected = async (email: string, collection: Collection, internal_ids: number[], collected: boolean) => {
  if (!email) {
    throw new Error('Email is required to delete card')
  }

  const now = new Date()
  const rows: CollectionRow[] = internal_ids.map((internal_id) => ({
    ...(collection.get(internal_id) ?? { email, internal_id, amount_owned: 0, amount_wanted: null, created_at: now, updated_at: now }),
    collected,
  }))

  const [updatedAccount, { error }] = await Promise.all([
    updateCollectionTimestamp(email, now),
    ...chunk(rows, 400).map((curr) => supabase.from('card_amounts').upsert(curr)),
  ])

  if (error) {
    throw new Error(`Error deleting from collection: ${error.message}`)
  }

  for (const row of rows) {
    collection.set(row.internal_id, row)
  }
  updateCollectionCache(collection, email, now)

  return {
    cards: collection,
    account: updatedAccount as UserAccountRow,
  }
}

// Helper functions
async function fetchCollectionFromAPI(table: string, key: string, value: string): Promise<Collection> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq(key, value)

  if (error) {
    throw new Error(`Error fetching collection: ${error.message}`)
  }

  if (!count) {
    return new Map()
  }

  const arr = await fetchAllRows(table, key, value)

  // Guard against a partial fetch ending up in the cache, where it would look like the user lost cards.
  if (arr.length < count) {
    throw new Error(`Error fetching collection: expected ${count} rows but got ${arr.length}`)
  }

  return new Map(arr.map((row) => [row.internal_id, { ...row, amount_wanted: row.amount_wanted ?? null }]))
}

// Pages on internal_id rather than on an offset. internal_id is unique per collection, so every page picks up exactly
// where the previous one ended, independent of the query plan Postgres happens to choose for that page.
async function fetchAllRows(table: string, key: string, value: string): Promise<CollectionRow[]> {
  const all: CollectionRow[] = []
  let after: number | null = null

  while (true) {
    let query = supabase.from(table).select('*').eq(key, value).order('internal_id', { ascending: true }).limit(PAGE_SIZE)
    if (after !== null) {
      query = query.gt('internal_id', after)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`Error fetching collection range: ${error.message}`)
    }

    const rows = (data ?? []) as unknown as CollectionRow[]
    all.push(...rows)

    if (rows.length < PAGE_SIZE) {
      return all
    }
    after = rows[rows.length - 1].internal_id
  }
}

function getCollectionFromCache(email: string): Collection | null {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available, cannot retrieve cached collection')
    return null
  }

  try {
    const cachedData = localStorage.getItem(`${COLLECTION_CACHE_KEY}_${email}`)
    if (cachedData) {
      const arr = JSON.parse(cachedData) as CollectionRow[]
      return new Map(
        arr.map((row) => [
          row.internal_id,
          { ...row, amount_wanted: row.amount_wanted ?? null, updated_at: new Date(row.updated_at), created_at: new Date(row.created_at) },
        ]),
      )
    }
  } catch (error) {
    console.error('Error retrieving collection from cache:', error)

    // If parse error, try to clear the corrupted cache
    if (error instanceof SyntaxError) {
      try {
        removeLocalCacheItems(email)
        console.log('Cleared corrupted cache data')
      } catch (clearError) {
        console.error('Failed to clear corrupted cache:', clearError)
      }
    }
  }
  return null
}

function updateCollectionCache(collection: Collection, email: string, timestamp: Date) {
  if (!email) {
    return
  }

  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available, cannot cache collection')
      return
    }

    if (!timestamp) {
      console.trace('Timestamp is not available, cannot cache collection')
    } else {
      // FIXIT: sometimes timestamp is a string, but I don't know why
      localStorage.setItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`, typeof timestamp === 'string' ? timestamp : timestamp.toISOString())
      localStorage.setItem(`${COLLECTION_CACHE_KEY}_${email}`, JSON.stringify([...collection.values()]))
    }
  } catch (error) {
    console.error('Error updating collection cache:', error)

    // Try to clear some space if quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        // Remove old cache entries to free up space
        localStorage.removeItem(`${COLLECTION_CACHE_KEY}_${email}`)
        console.log('Cleared old cache to free up space')
      } catch (clearError) {
        console.error('Failed to clear cache:', clearError)
      }
    }
  }
}
