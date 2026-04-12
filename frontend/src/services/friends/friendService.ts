import { supabase } from '@/lib/supabase'
import { umami } from '@/lib/utils.ts'
import type { FriendRow } from '@/types'

export async function getFriends(userId: string): Promise<FriendRow[]> {
  const { data, error } = await supabase
    .from('friends')
    .select('id,created_at,friend_id_accepter,friend_id_requester,state,username_accepter,username_requester')
    .or(`and(friend_id_requester.eq.${userId},state.in.(accepted,pending)),and(friend_id_accepter.eq.${userId},state.eq.accepted)`)

  if (error) {
    throw new Error(`Error fetching friends: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const isRequester = row.friend_id_requester === userId
    return {
      id: row.id,
      friend_id: isRequester ? row.friend_id_accepter : row.friend_id_requester,
      username: isRequester ? row.username_accepter : row.username_requester,
      state: row.state,
      created_at: new Date(row.created_at),
    } as FriendRow
  })
}

export async function getPendingRequests(userId: string): Promise<FriendRow[]> {
  const { data, error } = await supabase.from('friends').select('*').eq('friend_id_accepter', userId).eq('state', 'pending')

  if (error) {
    throw new Error(`Error fetching pending requests: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    friend_id: row.friend_id_requester ?? '',
    username: row.username_requester ?? '',
    state: row.state,
    created_at: new Date(row.created_at),
  })) as FriendRow[]
}

export async function manageFriend(friend_id: string, action: string): Promise<void> {
  umami(`Friend: ${action}`)

  const { error } = await supabase.functions.invoke('manage-friend', {
    method: 'POST',
    body: { friend_id, action },
  })
  if (error) {
    let message = 'Something went wrong. Please try again.'
    try {
      const body = await error.context.json()
      if (body?.error) {
        message = body.error
      }
    } catch {
      // ignore parse errors, fall through to generic message
    }
    throw new Error(message)
  }
}
