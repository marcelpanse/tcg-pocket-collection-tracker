import { supabase } from '@/lib/supabase'
import type { AccountRow, CardAmountsRowUpdate, CardAmountUpdate, Collection, CollectionRow } from '@/types'

export interface CollectionRowUpdate {
  email: string
  internal_id: number
  updated_at: Date
  card_id: string
}

const COLLECTION_CACHE_KEY = 'tcg_collection_cache_v2'
const COLLECTION_TIMESTAMP_KEY = 'tcg_collection_timestamp_v2'
const PAGE_SIZE = 500

export const removeLocalCacheItems = (email: string) => {
  // Invalidate local cache by removing records from localStorage
  localStorage.removeItem(`${COLLECTION_CACHE_KEY}_${email}`)
  localStorage.removeItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
}

export async function getCollection(email: string, collectionLastUpdatedRaw?: Date | string): Promise<Collection> {
  if (!email) {
    throw new Error('Email is required to fetch collection')
  }

  // it seems sometimes the collectionLastUpdated is a string, then we need to parse it into a Date.
  let collectionLastUpdated: Date | undefined
  if (typeof collectionLastUpdatedRaw === 'string') {
    collectionLastUpdated = new Date(collectionLastUpdatedRaw)
  } else {
    collectionLastUpdated = collectionLastUpdatedRaw
  }

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

export async function updateCollectionTimestamp(email: string, now: Date) {
  const { error, data } = await supabase
    .from('accounts')
    .update({ collection_last_updated: now })
    .eq('email', email)
    .select('*, trade_rarity_settings:trade_rarity_settings!email(*)')
    .single()
  if (error) {
    throw new Error(`Failed updating account: ${error.message}`)
  }
  return data as AccountRow
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
  const collectionRows: CollectionRowUpdate[] = rowsToUpdate.map((row) => ({
    email,
    card_id: row.card_id,
    internal_id: row.internal_id,
    updated_at: now,
  }))
  const amountRows: CardAmountsRowUpdate[] = rowsToUpdate
    .map((row) => ({
      email,
      internal_id: row.internal_id,
      amount_owned: row.amount_owned,
      amount_wanted: collection.get(row.internal_id)?.amount_wanted ?? null,
      updated_at: now,
    }))
    // Deduplicate amountRows on internal_id, needed for card csv import feature
    .filter((row, index, self) => index === self.findIndex((r) => r.internal_id === row.internal_id))

  // Execute all three database calls in parallel
  let account: AccountRow
  try {
    const [accountResult, cardAmountsResult] = await Promise.all([updateCollectionTimestamp(email, now), supabase.from('card_amounts').upsert(amountRows)])

    if (cardAmountsResult.error) {
      throw new Error(`Error bulk updating card amounts: ${cardAmountsResult.error.message}`)
    }

    // this has to be after the card amounts update because otherwise the FK can't be created.
    const collectionResult = await supabase.from('collection').upsert(collectionRows)
    if (collectionResult.error) {
      throw new Error(`Error bulk updating collection: ${collectionResult.error.message}`)
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

      if (row.card_id !== undefined && !existing.collection.includes(row.card_id)) {
        //collected a new card, so add it to the collection array
        existing.collection.push(row.card_id)
      }
    } else {
      // the card is not yet in the cache, so we need to add it.
      collection.set(row.internal_id, {
        email,
        internal_id: row.internal_id,
        amount_owned: row.amount_owned ?? 0,
        amount_wanted: null,
        created_at: now,
        updated_at: now,
        collection: row.card_id === undefined ? [] : [row.card_id],
      })
    }
  }

  updateCollectionCache(collection, email, now)

  return {
    cards: collection,
    account: account as AccountRow,
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
      collection: [],
    })
  }

  updateCollectionCache(collection, email, updated_at)

  return collection
}

export const deleteCard = async (email: string, collection: Collection, internal_id: number, cardId: string) => {
  if (!email) {
    throw new Error('Email is required to delete card')
  }
  if (!cardId) {
    throw new Error('Card ID is required to delete card')
  }

  const now = new Date()

  const [updatedAccount, { error: collectionError }] = await Promise.all([
    updateCollectionTimestamp(email, now),
    supabase.from('collection').delete().eq('card_id', cardId),
  ])

  if (collectionError) {
    throw new Error(`Error deleting from collection: ${collectionError.message}`)
  }

  // Find and update the cache - remove the card_id from the collection array and set amount_owned to 0
  const row = collection.get(internal_id)
  if (row?.collection.includes(cardId)) {
    row.collection = row.collection.filter((id) => id !== cardId)
    row.updated_at = now
    updateCollectionCache(collection, email, now)
  } else {
    throw new Error(`Cannot disown a card that is not already owned`)
  }

  return {
    cards: collection,
    account: updatedAccount as AccountRow,
  }
}

// Helper functions
async function fetchCollectionFromAPI(table: string, key: string, value: string): Promise<Collection> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq(key, value)

  if (error) {
    throw new Error(`Error fetching collection: ${error.message}`)
  }

  const arr = count ? await fetchRange(table, key, value, count, 0, PAGE_SIZE) : []
  return new Map(arr.map((row) => [row.internal_id, { ...row, amount_wanted: row.amount_wanted ?? null }]))
}

async function fetchRange(table: string, key: string, value: string, total: number, start: number, end: number): Promise<CollectionRow[]> {
  console.log('fetching range', total, start, end)

  let select = '*'
  if (!table.startsWith('public_')) {
    select += ', collection(card_id)'
  }
  const { data, error } = await supabase.from(table).select(select).eq(key, value).range(start, end)

  if (error) {
    throw new Error(`Error fetching collection range: ${error.message}`)
  }
  const rows = data as unknown as CollectionRow[]

  // collection is either an array of objects in case of the join, or it's an array of strings in case we get it from the public view.
  // convert them here to array of card_ids for easier handling in the code.
  for (const row of rows) {
    if (row.collection) {
      row.collection =
        row.collection
          .filter((c) => c !== null)
          .map((c: { card_id: string } | string) => {
            if (typeof c === 'string') {
              return c
            } else {
              return c.card_id
            }
          }) || []
    }
  }

  if (end < total) {
    return [...rows, ...(await fetchRange(table, key, value, total, end + 1, Math.min(total, end + PAGE_SIZE)))]
  } else {
    return rows
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

    console.log('Collection cache updated')
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
