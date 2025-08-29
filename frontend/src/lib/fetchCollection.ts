import type { CollectionRow } from '@/types'
import { supabase } from './Auth'

const COLLECTION_CACHE_KEY = 'tcg_collection_cache'
const COLLECTION_TIMESTAMP_KEY = 'tcg_collection_timestamp'

const PAGE_SIZE = 500

async function fetchCollection(table: string, key: string, value: string): Promise<CollectionRow[]> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq(key, value)
  if (error) {
    throw new Error('Error fetching collection')
  }
  if (!count) {
    return []
  }
  return await fetchRange(table, key, value, count, 0, PAGE_SIZE)
}

export async function fetchPublicCollection(friendId: string) {
  return await fetchCollection('public_cards', 'friendId', friendId)
}

export async function fetchOwnCollection(email: string, collectionLastUpdated: Date): Promise<CollectionRow[]> {
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available, cannot retrieve cached collection')
    return await fetchCollection('collection', 'email', email)
  }

  const cacheLastUpdatedRaw = localStorage.getItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`)
  const cacheLastUpdated = cacheLastUpdatedRaw && new Date(cacheLastUpdatedRaw)
  console.log(collectionLastUpdated, cacheLastUpdated)

  if (cacheLastUpdated && !Number.isNaN(cacheLastUpdated.getTime()) && cacheLastUpdated >= collectionLastUpdated) {
    const cachedCollection = getCollectionFromCache(email)
    if (cachedCollection !== null) {
      console.log('Using cached collection')
      return cachedCollection
    }
  }

  const collection = await fetchCollection('collection', 'email', email)
  updateCollectionCache(collection, email, collectionLastUpdated)
  return collection
}

export function updateCollectionCache(collection: CollectionRow[], email: string, collectionLastUpdated: Date) {
  if (!email) {
    return
  }

  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available, cannot cache collection')
      return
    }

    localStorage.setItem(`${COLLECTION_TIMESTAMP_KEY}_${email}`, collectionLastUpdated.toISOString())
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

/**
 * Get collection data from localStorage
 */
function getCollectionFromCache(email: string): CollectionRow[] | null {
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

async function fetchRange(table: string, key: string, value: string, total: number, start: number, end: number): Promise<CollectionRow[]> {
  console.log('fetching range', total, start, end)

  const { data, error } = await supabase.from(table).select().eq(key, value).range(start, end)
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection')
  }

  if (end < total) {
    return [...data, ...(await fetchRange(table, key, value, total, end + 1, Math.min(total, end + PAGE_SIZE)))]
  } else {
    return data
  }
}
