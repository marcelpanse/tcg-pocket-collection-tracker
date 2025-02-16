import type { AccountRow } from '@/types'
import { Query } from 'appwrite'
import { ACCOUNTS_ID, DATABASE_ID, getDatabase } from './Auth'

export async function fetchAccount(email: string) {
  const db = await getDatabase()
  const { documents } = await db.listDocuments(DATABASE_ID, ACCOUNTS_ID, [
    Query.select(['$id', 'username', 'friend_id']),
    Query.equal('email', email),
    Query.limit(1),
  ])
  if (documents.length > 0) {
    return documents[0] as unknown as AccountRow
  }
  return null
}
