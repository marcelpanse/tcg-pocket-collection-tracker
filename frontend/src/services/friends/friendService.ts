import { supabase } from '@/lib/supabase'
import { umami } from '@/lib/utils.ts'
import type { FriendRow } from '@/types'

export async function getFriends(email: string): Promise<FriendRow[]> {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .or(`and(email_requester.eq.${email},state.in.(accepted,pending)),and(email_accepter.eq.${email},state.eq.accepted)`)

  if (error) {
    throw new Error(`Error fetching friends: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const isRequester = row.email_requester === email
    return {
      id: row.id,
      friend_id: isRequester ? row.friend_id_accepter : row.friend_id_requester,
      username: isRequester ? row.username_accepter : row.username_requester,
      state: row.state,
      created_at: new Date(row.created_at),
    } as FriendRow
  })
}

export async function getPendingRequests(email: string): Promise<FriendRow[]> {
  const { data, error } = await supabase.from('friends').select('*').eq('email_accepter', email).eq('state', 'pending')

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
