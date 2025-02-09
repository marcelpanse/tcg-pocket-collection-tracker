import type { CollectionRow } from '@/types'
import { Query } from 'appwrite'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from './Auth'

export async function fetchCollection() {
  const db = await getDatabase()
  // this gets all your cards at once (max 5k unique cards - there aren't that many unique cards yet), not sure what it does with performance, but we'll see ;-)
  const { documents } = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5000)])
  return documents as CollectionRow[]
}
