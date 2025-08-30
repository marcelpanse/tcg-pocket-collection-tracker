import type { AccountRow, CollectionRow } from '@/types/index.ts'
import { fetchPublicAccount } from './fetchAccount.ts'
import { fetchPublicCollection } from './fetchCollection.ts'

export type FriendCollectionLoaderParams = {
  params: { friendId?: string }
}

// Note that this does not acount for the {} case. If the route can miss friendId, add it manually.
export type FriendCollectionLoaderReturn = {
  friendAccount: AccountRow
  friendCollection: CollectionRow[]
}

export async function friendCollectionLoader({ params }: FriendCollectionLoaderParams) {
  const friendId = params.friendId
  if (!friendId) {
    return {}
  }

  const account = fetchPublicAccount(friendId)
  const collection = fetchPublicCollection(friendId)
  return { friendAccount: await account, friendCollection: await collection }
}
