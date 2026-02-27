import { supabase } from '@/lib/supabase'
import type { FriendRow } from '@/types'

export async function getFriends(email: string): Promise<FriendRow[]> {
  const { data, error } = await supabase
    .from('friends')
    .select(
      `
      *,
      requester:accounts!email_requester(friend_id),
      accepter:accounts!email_accepter(friend_id)
    `,
    )
    .or(`and(email_requester.eq.${email},state.in.(accepted,pending)),and(email_accepter.eq.${email},state.eq.accepted)`)

  if (error) {
    throw new Error(`Error fetching friends: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const isRequester = row.email_requester === email
    return {
      id: row.id,
      friend_id: isRequester ? row.accepter?.friend_id : row.requester?.friend_id,
      username: isRequester ? row.username_accepter : row.username_requester,
      state: row.state,
      created_at: new Date(row.created_at),
    } as FriendRow
  })
}

export async function getPendingRequests(email: string): Promise<FriendRow[]> {
  const { data, error } = await supabase
    .from('friends')
    .select(
      `
      *,
      requester:accounts!email_requester(friend_id)
    `,
    )
    .eq('email_accepter', email)
    .eq('state', 'pending')

  if (error) {
    throw new Error(`Error fetching pending requests: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    friend_id: row.requester?.friend_id ?? '',
    username: row.username_requester ?? '',
    state: row.state,
    created_at: new Date(row.created_at),
  })) as FriendRow[]
}

export async function manageFriend(friend_id: string, action: string): Promise<void> {
  const { error } = await supabase.functions.invoke('manage-friend', {
    method: 'POST',
    body: { friend_id, action },
  })
  if (error) {
    throw new Error(`Error managing friend: ${error.message}`)
  }
}
