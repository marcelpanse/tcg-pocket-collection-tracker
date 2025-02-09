import type { Models } from 'appwrite'
import { createContext } from 'react'

export type User = Models.User<Models.Preferences>

interface IUserContext {
  user: User | null
  signOut: () => void
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: (isLoginDialogOpen: boolean) => void
}

export const UserContext = createContext<IUserContext>({
  user: null,
  signOut: () => {},
  isLoginDialogOpen: false,
  setIsLoginDialogOpen: () => {},
})
