import { supabase } from '@/lib/supabase'
import type { AccountRow, CollectionRow, CollectionRowUpdate } from '@/types'

const COLLECTION_CACHE_KEY = 'tcg_collection_cache'
const COLLECTION_TIMESTAMP_KEY = 'tcg_collection_timestamp'
const PAGE_SIZE = 500

export const getCollection = async (email: string, collectionLastUpdated?: Date) => {
  if (!email) {
    throw new Error('Email is required to fetch collection')
  }

  // Check if we should use cached data
  if (collectionLastUpdated) {
    const cachedCollection = getCollectionFromCache(email)
    const cacheLastUpdatedRaw = localStorage.getItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
    const cacheLastUpdated = cacheLastUpdatedRaw && new Date(cacheLastUpdatedRaw)

    if (cacheLastUpdated && !Number.isNaN(cacheLastUpdated.getTime()) && cacheLastUpdated >= collectionLastUpdated && cachedCollection !== null) {
      console.log('Using cached collection')
      return cachedCollection
    }
  }

  // Fetch from API if cache is invalid or not available
  const collection = await fetchCollectionFromAPI('collection', 'email', email)

  // Update cache with new data
  if (collectionLastUpdated) {
    updateCollectionCache(collection, email, collectionLastUpdated)
  }

  return collection
}

export const getPublicCollection = async (friendId: string) => {
  if (!friendId) {
    throw new Error('Friend ID is required to fetch public collection')
  }

  return await fetchCollectionFromAPI('public_cards', 'friend_id', friendId)
}

export const updateCards = async (email: string, rowsToUpdate: CollectionRowUpdate[]) => {
  if (!email) {
    throw new Error('Email is required to update cards')
  }
  if (!rowsToUpdate.length) {
    throw new Error('No card updates provided')
  }

  const now = new Date()
  const nowString = now.toISOString()
  const rows: CollectionRow[] = rowsToUpdate.map((row) => ({ ...row, email, updated_at: nowString }))

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
  const { error: collectionError } = await supabase.from('collection').upsert(rows)

  if (collectionError) {
    throw new Error(`Error bulk updating collection: ${collectionError.message}`)
  }

  // Update cache with the changes
  const latestFromCache = getCollectionFromCache(email) || (await fetchCollectionFromAPI('collection', 'email', email))

  const updatedCards = latestFromCache.map((row) => {
    const updated = rowsToUpdate.find((r) => r.card_id === row.card_id)
    if (updated === undefined) {
      return row
    } else {
      return { ...row, ...updated }
    }
  })

  const newlyAdded = rows.filter((row) => latestFromCache.find((r) => r.card_id === row.card_id) === undefined)
  updatedCards.push(...newlyAdded)

  updateCollectionCache(updatedCards, email, now)

  return {
    cards: updatedCards,
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

  const { data, error } = await supabase.from(table).select().eq(key, value).range(start, end)

  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection range')
  }

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

    localStorage.setItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`, timestamp.toISOString())
    localStorage.setItem(`${COLLECTION_CACHE_KEY}_${email}`, JSON.stringify(collection))

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
