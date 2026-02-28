import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAccount } from '@/services/account/useAccount'
import { getUnreadCounts } from '@/services/chat/chatService'
import { ChatContext, type OpenChat } from './ChatContext'

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id
  const [openChats, setOpenChats] = useState<OpenChat[]>([])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // On mount (when account loads), fetch unread counts and open minimized chats
  useEffect(() => {
    if (!myFriendId) {
      return
    }

    getUnreadCounts(myFriendId).then((counts) => {
      for (const [senderId, count] of Object.entries(counts)) {
        if (count > 0) {
          setOpenChats((prev) => {
            const existing = prev.find((c) => c.friendId === senderId)
            if (existing) {
              return prev
            }
            return [...prev, { friendId: senderId, username: senderId, minimized: true, unreadCount: count }]
          })
        }
      }
    })

    // Subscribe to inbox channel for incoming messages
    const channel = supabase.channel(`inbox:${myFriendId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const senderFriendId: string = payload.sender_friend_id
        const senderUsername: string = payload.sender_username ?? senderFriendId

        setOpenChats((prev) => {
          const existing = prev.find((c) => c.friendId === senderFriendId)
          if (!existing) {
            return [...prev, { friendId: senderFriendId, username: senderUsername, minimized: true, unreadCount: 1 }]
          }
          if (existing.minimized) {
            return prev.map((c) => (c.friendId === senderFriendId ? { ...c, unreadCount: c.unreadCount + 1 } : c))
          }
          // Chat is open and not minimized — no unread increment
          return prev
        })
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [myFriendId])

  const isMobile = () => window.matchMedia('(max-width: 639px)').matches

  const openChat = (friendId: string, username: string) => {
    setOpenChats((prev) => {
      const existing = prev.find((c) => c.friendId === friendId)
      if (isMobile()) {
        // On mobile: minimize all others, expand target
        if (existing) {
          return prev.map((c) => (c.friendId === friendId ? { ...c, minimized: false } : { ...c, minimized: true }))
        }
        return [...prev.map((c) => ({ ...c, minimized: true })), { friendId, username, minimized: false, unreadCount: 0 }]
      }
      if (existing) {
        return prev.map((c) => (c.friendId === friendId ? { ...c, minimized: false } : c))
      }
      return [...prev, { friendId, username, minimized: false, unreadCount: 0 }]
    })
  }

  const closeChat = (friendId: string) => {
    setOpenChats((prev) => prev.filter((c) => c.friendId !== friendId))
  }

  const toggleMinimize = (friendId: string) => {
    setOpenChats((prev) => prev.map((c) => (c.friendId === friendId ? { ...c, minimized: !c.minimized } : c)))
  }

  const expandExclusive = (friendId: string) => {
    setOpenChats((prev) => prev.map((c) => (c.friendId === friendId ? { ...c, minimized: false } : { ...c, minimized: true })))
  }

  const incrementUnread = (friendId: string) => {
    setOpenChats((prev) => prev.map((c) => (c.friendId === friendId ? { ...c, unreadCount: c.unreadCount + 1 } : c)))
  }

  const clearUnread = (friendId: string) => {
    setOpenChats((prev) => prev.map((c) => (c.friendId === friendId ? { ...c, unreadCount: 0 } : c)))
  }

  return (
    <ChatContext.Provider value={{ openChats, openChat, closeChat, toggleMinimize, expandExclusive, incrementUnread, clearUnread }}>
      {children}
    </ChatContext.Provider>
  )
}
