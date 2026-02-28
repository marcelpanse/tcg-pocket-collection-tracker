import { useEffect, useState } from 'react'
import { useChatContext } from '@/context/ChatContext'
import { ChatBox } from './ChatBox'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 639px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

export function ChatManager() {
  const { openChats } = useChatContext()
  const isMobile = useIsMobile()

  if (isMobile) {
    const expandedChat = openChats.find((c) => !c.minimized)

    if (expandedChat) {
      // Only render the expanded chat; minimized ones are hidden until it closes
      return (
        <ChatBox
          key={expandedChat.friendId}
          friendId={expandedChat.friendId}
          username={expandedChat.username}
          minimized={false}
          unreadCount={expandedChat.unreadCount}
          position={0}
          isMobile
        />
      )
    }

    // All minimized: stack headers vertically, one above the other
    return (
      <>
        {openChats.map((chat, index) => (
          <ChatBox
            key={chat.friendId}
            friendId={chat.friendId}
            username={chat.username}
            minimized={true}
            unreadCount={chat.unreadCount}
            position={index}
            isMobile
          />
        ))}
      </>
    )
  }

  // Desktop: side-by-side
  return (
    <>
      {openChats.map((chat, index) => (
        <ChatBox
          key={chat.friendId}
          friendId={chat.friendId}
          username={chat.username}
          minimized={chat.minimized}
          unreadCount={chat.unreadCount}
          position={index}
          isMobile={false}
        />
      ))}
    </>
  )
}
