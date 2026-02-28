import { Minus, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChatContext } from '@/context/ChatContext'
import { supabase } from '@/lib/supabase'
import { useAccount } from '@/services/account/useAccount'
import { useMarkAsRead, useMessages, useSendMessage } from '@/services/chat/useChat'
import type { MessageRow } from '@/types'

function FriendAvatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  return <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-xs font-semibold text-neutral-200">{initials}</div>
}

interface ChatBoxProps {
  friendId: string
  username: string
  minimized: boolean
  unreadCount: number
  position: number
  isMobile: boolean
}

export function ChatBox({ friendId, username, minimized, unreadCount, position, isMobile }: ChatBoxProps) {
  const { data: account } = useAccount()
  const myFriendId = account?.friend_id
  const { closeChat, toggleMinimize, expandExclusive, clearUnread } = useChatContext()
  const { data: messages = [] } = useMessages(friendId)
  const sendMessage = useSendMessage()
  const markAsRead = useMarkAsRead()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const [localMessages, setLocalMessages] = useState<MessageRow[]>([])

  // Sync local messages from query data
  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, minimized])

  // Mark as read when chat is opened/expanded
  useEffect(() => {
    if (!minimized && myFriendId && friendId) {
      markAsRead.mutate({ theirFriendId: friendId })
      clearUnread(friendId)
    }
  }, [minimized, myFriendId, friendId])

  // Subscribe to real-time chat channel
  useEffect(() => {
    if (!myFriendId) {
      return
    }

    const sortedIds = [myFriendId, friendId].sort()
    const channelName = `chat:${sortedIds[0]}:${sortedIds[1]}`
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const newMsg: MessageRow = {
          id: payload.id,
          sender_friend_id: payload.sender_friend_id,
          receiver_friend_id: payload.receiver_friend_id,
          content: payload.content,
          created_at: new Date(payload.created_at),
          read_at: payload.read_at ? new Date(payload.read_at) : null,
        }
        setLocalMessages((prev) => {
          // Avoid duplicate if already in list
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev
          }
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [myFriendId, friendId])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !myFriendId) {
      return
    }
    setInput('')

    try {
      await sendMessage.mutateAsync({ receiverFriendId: friendId, content })

      // Broadcast to chat channel
      const sortedIds = [myFriendId, friendId].sort()
      const channelName = `chat:${sortedIds[0]}:${sortedIds[1]}`
      const newMsg: MessageRow = {
        id: Date.now(),
        sender_friend_id: myFriendId,
        receiver_friend_id: friendId,
        content,
        created_at: new Date(),
        read_at: null,
      }
      setLocalMessages((prev) => [...prev, newMsg])

      await supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'message',
        payload: { ...newMsg, created_at: newMsg.created_at.toISOString() },
      })

      // Broadcast to receiver's inbox
      await supabase.channel(`inbox:${friendId}`).send({
        type: 'broadcast',
        event: 'message',
        payload: { sender_friend_id: myFriendId, sender_username: account?.username ?? myFriendId },
      })
    } catch {
      // Silently fail — message not sent
    }
  }

  const handleHeaderClick = () => {
    if (isMobile && minimized) {
      expandExclusive(friendId)
    } else {
      toggleMinimize(friendId)
    }
  }

  // Each minimized header is ~44px tall (h-7 avatar + py-2 padding)
  const HEADER_H = 44
  const style = isMobile ? { left: 8, right: 8, bottom: minimized ? position * HEADER_H : 0 } : { right: 16 + position * 332, width: 316, bottom: 0 }

  return (
    <div className="fixed z-50 flex flex-col rounded-t-xl border border-neutral-700 bg-neutral-900 shadow-2xl" style={style}>
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl border-b border-neutral-700 bg-neutral-800 px-3 py-2">
        <button type="button" onClick={handleHeaderClick} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left">
          <FriendAvatar name={username} />
          <span className="flex-1 truncate text-sm font-medium">{username}</span>
          {minimized && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">{unreadCount}</span>
          )}
        </button>
        <button type="button" onClick={handleHeaderClick} className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200">
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            closeChat(friendId)
          }}
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="flex h-72 flex-col gap-2 overflow-y-auto p-3">
            {localMessages.length === 0 && <p className="text-center text-xs text-neutral-500 mt-auto mb-auto">No messages yet. Say hi!</p>}
            {localMessages.map((msg, i) => {
              const isOwn = msg.sender_friend_id === myFriendId
              return (
                <div key={msg.id ?? i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                      isOwn ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm bg-neutral-700 text-neutral-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-neutral-700 p-2">
            <input
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
