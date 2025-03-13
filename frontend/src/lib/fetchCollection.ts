import { supabase } from './Auth'
import type { CollectionRow } from '@/types'

export async function fetchCollection() {
  // const db = await getDatabase()
  // this gets all your cards at once (max 5k unique cards - there aren't that many unique cards yet), not sure what it does with performance, but we'll see ;-)
  // const { documents } = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.select(['$id', 'amount_owned', 'card_id', 'email']), Query.limit(5000)])
  // return documents as CollectionRow[]

  const { data, error } = await supabase.from('collection').select('email, card_id, amount_owned')
  if (error) {
    console.log('supa error', error)
    throw new Error('Error fetching collection')
  } else {
    console.log('supa data', data)
    return data as CollectionRow[]
  }
}
