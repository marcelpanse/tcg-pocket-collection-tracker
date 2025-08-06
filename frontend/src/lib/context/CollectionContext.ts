import type { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'
import type { CollectionRow } from '@/types'

interface ICollectionContext {
  ownedCards: CollectionRow[]
  setOwnedCards: Dispatch<SetStateAction<CollectionRow[]>>
  selectedCardId: string
  setSelectedCardId: (cardId: string) => void
  selectedMissionCardOptions: string[]
  setSelectedMissionCardOptions: (missionCardOptions: string[]) => void
}

export const CollectionContext = createContext<ICollectionContext>({
  ownedCards: [],
  setOwnedCards: () => {},
  selectedCardId: '',
  setSelectedCardId: () => {},
  selectedMissionCardOptions: [],
  setSelectedMissionCardOptions: () => {},
})
