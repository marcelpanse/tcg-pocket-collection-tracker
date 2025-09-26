import { createContext } from 'react'

export interface IDialogContext {
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isOpen: boolean) => void
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: (isOpen: boolean) => void
  selectedCardId: string | undefined
  setSelectedCardId: (id: string | undefined) => void
}

export const DialogContext = createContext<IDialogContext>({
  isProfileDialogOpen: false,
  setIsProfileDialogOpen: () => {},
  isLoginDialogOpen: false,
  setIsLoginDialogOpen: () => {},
  selectedCardId: undefined,
  setSelectedCardId: () => {},
})
