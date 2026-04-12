import { createContext, useContext } from 'react'

export interface OpenChat {
  friendId: string
  username: string
  minimized: boolean
  unreadCount: number
}

export interface ChatContextType {
  openChats: OpenChat[]
  openChat: (friendId: string, username: string) => void
  closeChat: (friendId: string) => void
  toggleMinimize: (friendId: string) => void
  expandExclusive: (friendId: string) => void
  incrementUnread: (friendId: string) => void
  clearUnread: (friendId: string) => void
}

export const ChatContext = createContext<ChatContextType>({
  openChats: [],
  openChat: () => {},
  closeChat: () => {},
  toggleMinimize: () => {},
  expandExclusive: () => {},
  incrementUnread: () => {},
  clearUnread: () => {},
})

export function useChatContext() {
  return useContext(ChatContext)
}
