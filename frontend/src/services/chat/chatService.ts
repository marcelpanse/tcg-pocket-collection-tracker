import { supabase } from '@/lib/supabase'
import { umami } from '@/lib/utils.ts'
import type { MessageRow } from '@/types'

export async function getMessages(myFriendId: string, theirFriendId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_friend_id.eq.${myFriendId},receiver_friend_id.eq.${theirFriendId}),and(sender_friend_id.eq.${theirFriendId},receiver_friend_id.eq.${myFriendId})`,
    )
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Error fetching messages: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    ...row,
    created_at: new Date(row.created_at),
    read_at: row.read_at ? new Date(row.read_at) : null,
  })) as MessageRow[]
}

export async function sendMessage(senderFriendId: string, receiverFriendId: string, content: string): Promise<void> {
  umami('Chat: Send Message')

  const { error } = await supabase.from('messages').insert({
    sender_friend_id: senderFriendId,
    receiver_friend_id: receiverFriendId,
    content,
  })

  if (error) {
    throw new Error(`Error sending message: ${error.message}`)
  }
}

export async function markAsRead(myFriendId: string, theirFriendId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_friend_id', myFriendId)
    .eq('sender_friend_id', theirFriendId)
    .is('read_at', null)

  if (error) {
    throw new Error(`Error marking messages as read: ${error.message}`)
  }
}

export async function getUnreadCounts(myFriendId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('messages').select('sender_friend_id').eq('receiver_friend_id', myFriendId).is('read_at', null)

  if (error) {
    throw new Error(`Error fetching unread counts: ${error.message}`)
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.sender_friend_id] = (counts[row.sender_friend_id] ?? 0) + 1
  }
  return counts
}
