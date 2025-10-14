import { supabase } from '@/lib/supabase'
import type { AccountRow, CardAmountsRowUpdate, CardAmountUpdate, CollectionRow, CollectionRowUpdate } from '@/types'

const COLLECTION_CACHE_KEY = 'tcg_collection_cache_v2'
const COLLECTION_TIMESTAMP_KEY = 'tcg_collection_timestamp_v2'
const PAGE_SIZE = 500

export const getCollection = async (email: string, collectionLastUpdated?: Date): Promise<Map<number, CollectionRow>> => {
  if (!email) {
    throw new Error('Email is required to fetch collection')
  }

  // Check if we should use cached data
  if (collectionLastUpdated) {
    const cachedCollection = getCollectionFromCache(email)
    const cacheLastUpdatedRaw = localStorage.getItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
    const cacheLastUpdated = cacheLastUpdatedRaw && new Date(cacheLastUpdatedRaw)

    if (cacheLastUpdated && !Number.isNaN(cacheLastUpdated.getTime()) && cacheLastUpdated >= collectionLastUpdated && cachedCollection !== null) {
      console.log('Using cached collection', cachedCollection.length)
      return new Map(cachedCollection.map((row) => [row.internal_id, row]))
    }
  }

  // Fetch from API if cache is invalid or not available
  const collection = await fetchCollectionFromAPI('card_amounts', 'email', email)
  console.log('collection', collection.length)

  // Update cache with new data
  if (collectionLastUpdated) {
    updateCollectionCache(collection, email, collectionLastUpdated)
  }

  return new Map(collection.map((row) => [row.internal_id, row]))
}

export const getPublicCollection = async (friendId: string): Promise<Map<number, CollectionRow>> => {
  if (!friendId) {
    throw new Error('Friend ID is required to fetch public collection')
  }

  const collection = await fetchCollectionFromAPI('public_card_amounts', 'friend_id', friendId)
  return new Map(collection.map((row) => [row.internal_id, row]))
}

export const updateCards = async (email: string, rowsToUpdate: CardAmountUpdate[]) => {
  if (!email) {
    throw new Error('Email is required to update cards')
  }
  if (!rowsToUpdate.length) {
    throw new Error('No card updates provided')
  }

  const now = new Date()
  const nowString = now.toISOString()

  // First fetch the current account data
  const { data: account, error: accountError } = await supabase.from('accounts').select().eq('email', email).single()

  if (accountError) {
    throw new Error(`Error fetching account: ${accountError.message}`)
  }

  // Update account's collection_last_updated timestamp
  const { error: accountUpdateError, data: updatedAccount } = await supabase
    .from('accounts')
    .upsert({ ...account, collection_last_updated: now })
    .select()
    .single()

  if (accountUpdateError) {
    throw new Error(`Error updating account timestamp: ${accountUpdateError.message}`)
  }

  // Update collection records
  const collectionRows: CollectionRowUpdate[] = rowsToUpdate.map((row) => ({
    email,
    card_id: row.card_id,
    internal_id: row.internal_id,
    updated_at: nowString,
  }))
  const amountRows: CardAmountsRowUpdate[] = rowsToUpdate.map((row) => ({
    email,
    internal_id: row.internal_id,
    amount_owned: row.amount_owned,
    updated_at: nowString,
  }))

  //then update the card amounts
  const { error: cardAmountsError } = await supabase.from('card_amounts').upsert(amountRows)
  if (cardAmountsError) {
    throw new Error(`Error bulk updating collection: ${cardAmountsError?.message}`)
  }

  const { error: collectionError } = await supabase.from('collection').upsert(collectionRows)
  if (collectionError) {
    throw new Error(`Error bulk updating collection: ${collectionError?.message}`)
  }

  // Update cache with the changes
  const latestFromCache = getCollectionFromCache(email) || (await fetchCollectionFromAPI('collection', 'email', email))

  for (const row of rowsToUpdate) {
    // for each card that has updated, we need to find the matching internal card in the cache by internal_id and update it.
    const rowFromCacheToUpdate = latestFromCache.find((r) => r.internal_id === row.internal_id)
    if (rowFromCacheToUpdate) {
      rowFromCacheToUpdate.amount_owned = row.amount_owned
      rowFromCacheToUpdate.updated_at = nowString

      if (!rowFromCacheToUpdate.collection.includes(row.card_id)) {
        //collected a new card, so add it to the collection array
        rowFromCacheToUpdate.collection.push(row.card_id)
      }
    }

    if (!rowFromCacheToUpdate) {
      // the card is not yet in the cache, so we need to add it.
      latestFromCache.push({
        internal_id: row.internal_id,
        email,
        created_at: nowString,
        updated_at: nowString,
        collection: [row.card_id],
        amount_owned: row.amount_owned,
      })
    }
  }

  updateCollectionCache(latestFromCache, email, now)

  return {
    cards: new Map(latestFromCache.map((row) => [row.internal_id, row])),
    account: updatedAccount as AccountRow,
  }
}

// Helper functions
async function fetchCollectionFromAPI(table: string, key: string, value: string): Promise<CollectionRow[]> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq(key, value)

  if (error) {
    console.log(error)
    throw new Error(`Error fetching collection: ${error.message}`)
  }

  if (!count) {
    return []
  }

  return await fetchRange(table, key, value, count, 0, PAGE_SIZE)
}

async function fetchRange(table: string, key: string, value: string, total: number, start: number, end: number): Promise<CollectionRow[]> {
  console.log('fetching range', total, start, end)

  const { data, error } = await supabase
    .from(table)
    .select(`
    *,
    collection!collection_email_internal_id_fkey (
      card_id
    )
  `)
    .eq(key, value)
    .range(start, end)

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection range')
  }

  // convert to array of card_ids instead of nested objects for easier handling in the code.
  data.forEach((row) => {
    row.collection = row.collection?.map((c: { card_id: string }) => c.card_id) || []
  })

  console.log('fetched range', data)

  if (end < total) {
    return [...data, ...(await fetchRange(table, key, value, total, end + 1, Math.min(total, end + PAGE_SIZE)))]
  } else {
    return data
  }
}

function getCollectionFromCache(email: string): CollectionRow[] | null {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available, cannot retrieve cached collection')
    return null
  }

  try {
    const cachedData = localStorage.getItem(`${COLLECTION_CACHE_KEY}_${email}`)
    if (cachedData) {
      return JSON.parse(cachedData)
    }
  } catch (error) {
    console.error('Error retrieving collection from cache:', error)

    // If parse error, try to clear the corrupted cache
    if (error instanceof SyntaxError) {
      try {
        localStorage.removeItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
        localStorage.removeItem(`${COLLECTION_CACHE_KEY}_${email}`)
        console.log('Cleared corrupted cache data')
      } catch (clearError) {
        console.error('Failed to clear corrupted cache:', clearError)
      }
    }
  }
  return null
}

function updateCollectionCache(collection: CollectionRow[], email: string, timestamp: Date) {
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
      localStorage.setItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`, timestamp.toISOString())
      localStorage.setItem(`${COLLECTION_CACHE_KEY}_${email}`, JSON.stringify(collection))
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
