import { createContext } from 'react'

export interface IDialogContext {
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isOpen: boolean) => void
  isLoginDialogOpen: boolean
  setIsLoginDialogOpen: (isOpen: boolean) => void
  selectedCardId: number | undefined
  setSelectedCardId: (id: number | undefined) => void
}

export const DialogContext = createContext<IDialogContext>({
  isProfileDialogOpen: false,
  setIsProfileDialogOpen: () => {},
  isLoginDialogOpen: false,
  setIsLoginDialogOpen: () => {},
  selectedCardId: undefined,
  setSelectedCardId: () => {},
})
