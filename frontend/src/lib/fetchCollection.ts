import type { CollectionRow } from '@/types'
import { supabase } from './Auth'

const COLLECTION_CACHE_KEY = 'tcg_collection_cache'
const COLLECTION_COUNT_KEY = 'tcg_collection_count'

const PAGE_SIZE = 500

export async function fetchCollection(email?: string, friendId?: string) {
  const tableName = friendId ? 'public_cards' : 'collection'
  const key = friendId ? 'friend_id' : 'email'
  const value = friendId ?? email ?? ''

  // Don't use cache for friend collections
  if (!friendId && email) {
    // Try to get from cache first
    const cachedCollection = getCollectionFromCache(email)

    if (cachedCollection) {
      // Validate cache by checking if count matches
      try {
        const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true }).eq(key, value)

        if (error) throw new Error('Error fetching collection count')

        if (!count) {
          console.log('No collection found in database')
          return []
        }

        // Get the cached count
        const cachedCount = localStorage.getItem(`${COLLECTION_COUNT_KEY}_${email}`)

        // If count matches cached count, return cached collection
        if (cachedCount && Number.parseInt(cachedCount, 10) === count) {
          console.log('Using cached collection data, count matches:', count)
          return cachedCollection
        }

        console.log('Cache count mismatch - cached:', cachedCount, 'actual:', count)

        // Count doesn't match, fetch fresh data
        console.log('Cache count mismatch, fetching fresh collection data')
        return await fetchAndCacheCollection(tableName, key, value, count, email)
      } catch (error) {
        console.error('Error validating cache:', error)
        // On error, fall back to cached data
        return cachedCollection
      }
    }
  }

  // No cache available or friend collection, fetch from API
  const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true }).eq(key, value)

  if (error) throw new Error('Error fetching collection')

  if (!count) {
    return []
  }

  const collection = await fetchRange({ tableName, key, value, total: count, start: 0, end: PAGE_SIZE })

  // Cache the collection if it's not a friend's collection
  if (!friendId && email) {
    saveCollectionToCache(email, collection, count)
  }

  return collection
}

/**
 * Save collection data to localStorage
 */
export function saveCollectionToCache(email: string, collection: CollectionRow[], count: number) {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available, cannot cache collection')
      return
    }

    localStorage.setItem(`${COLLECTION_CACHE_KEY}_${email}`, JSON.stringify(collection))
    localStorage.setItem(`${COLLECTION_COUNT_KEY}_${email}`, count.toString())
    console.log('Collection saved to cache')
  } catch (error) {
    console.error('Error saving collection to cache:', error)
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
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available, cannot retrieve cached collection')
      return null
    }

    const cachedData = localStorage.getItem(`${COLLECTION_CACHE_KEY}_${email}`)
    if (cachedData) {
      return JSON.parse(cachedData)
    }
  } catch (error) {
    console.error('Error retrieving collection from cache:', error)

    // If parse error, try to clear the corrupted cache
    if (error instanceof SyntaxError) {
      try {
        localStorage.removeItem(`${COLLECTION_CACHE_KEY}_${email}`)
        localStorage.removeItem(`${COLLECTION_COUNT_KEY}_${email}`)
        console.log('Cleared corrupted cache data')
      } catch (clearError) {
        console.error('Failed to clear corrupted cache:', clearError)
      }
    }
  }
  return null
}

/**
 * Fetch collection data from API and update cache
 */
async function fetchAndCacheCollection(tableName: string, key: string, value: string, count: number, email: string) {
  const collection = await fetchRange({ tableName, key, value, total: count, start: 0, end: PAGE_SIZE })
  saveCollectionToCache(email, collection, count)
  return collection
}

/**
 * Update the collection cache with the latest collection data
 * This function is used when modifying the collection
 */
export function updateCollectionCache(collection: CollectionRow[], email: string) {
  if (!email) return

  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available, cannot cache collection')
      return
    }

    // Save collection to cache
    localStorage.setItem(`${COLLECTION_CACHE_KEY}_${email}`, JSON.stringify(collection))

    // Update count in cache
    localStorage.setItem(`${COLLECTION_COUNT_KEY}_${email}`, collection.length.toString())

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

interface FetchRangeParams {
  tableName: string
  key: string
  value: string
  total: number
  start: number
  end: number
}

const fetchRange = async ({ tableName, key, value, total, start, end }: FetchRangeParams): Promise<CollectionRow[]> => {
  console.log('fetching range', total, start, end)

  const { data, error } = await supabase.from(tableName).select().eq(key, value).range(start, end)
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection')
  }

  if (end < total) {
    return [...data, ...(await fetchRange({ tableName, key, value, total, start: end + 1, end: Math.min(total, end + PAGE_SIZE) }))]
  }

  return data as CollectionRow[]
}
