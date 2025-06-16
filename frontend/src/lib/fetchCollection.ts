import type { CollectionRow } from '@/types'
import { supabase } from './Auth'

const PAGE_SIZE = 500

export async function fetchCollection(email?: string, friendId?: string) {
  const tableName = friendId ? 'public_cards' : 'collection'
  const key = friendId ? 'friend_id' : 'email'
  const value = friendId ?? email ?? ''
  const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true }).eq(key, value)

  if (error) throw new Error('Error fetching collection')

  if (!count) {
    return []
  }

  return fetchRange({ tableName, key, value, total: count, start: 0, end: PAGE_SIZE })
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
