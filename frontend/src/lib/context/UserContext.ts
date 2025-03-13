import type { AccountRow } from '@/types'
import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

export type User = Session

interface IUserContext {
  user: User | null
  setUser: (user: User | null) => void
  account: AccountRow | null
  setAccount: (account: AccountRow | null) => void
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: (isLoginDialogOpen: boolean) => void
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isProfileDialogOpen: boolean) => void
}

export const UserContext = createContext<IUserContext>({
  user: null,
  setUser: () => {},
  account: null,
  setAccount: () => {},
  isLoginDialogOpen: false,
  setIsLoginDialogOpen: () => {},
  isProfileDialogOpen: false,
  setIsProfileDialogOpen: () => {},
})
