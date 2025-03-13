import type { CollectionRow } from '@/types'
import { supabase } from './Auth'

const PAGE_SIZE = 500

export async function fetchCollection() {
  const { count, error } = await supabase.from('collection').select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error('Error fetching collection')
  }

  if (!count) {
    return []
  }

  return fetchRange(count, 0, PAGE_SIZE)
}

const fetchRange = async (total: number, start: number, end: number): Promise<CollectionRow[]> => {
  console.log('fetching range', total, start, end)

  const { data, error } = await supabase.from('collection').select('email, card_id, amount_owned').range(start, end)
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection')
  }

  if (end < total) {
    return [...data, ...(await fetchRange(total, end, Math.min(total, end + PAGE_SIZE)))]
  }

  return data as CollectionRow[]
}
