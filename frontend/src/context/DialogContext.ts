import { createContext } from 'react'

export interface IDialogContext {
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isOpen: boolean) => void
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: (isOpen: boolean) => void
  selectedCardId: string
  setSelectedCardId: (id: string) => void
}

export const DialogContext = createContext<IDialogContext>({
  isProfileDialogOpen: false,
  setIsProfileDialogOpen: () => {},
  isLoginDialogOpen: false,
  setIsLoginDialogOpen: () => {},
  selectedCardId: '',
  setSelectedCardId: () => {},
})
