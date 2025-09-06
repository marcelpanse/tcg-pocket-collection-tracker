import { createContext } from 'react'
import type { CollectionRow, CollectionRowUpdate } from '@/types'

interface ICollectionContext {
  ownedCards: CollectionRow[]
  ownedCardsMap: Map<string, CollectionRow>
  updateCards: (rows: CollectionRowUpdate[]) => Promise<void>
  selectedCardId: string
  setSelectedCardId: (cardId: string) => void
  selectedMissionCardOptions: string[]
  setSelectedMissionCardOptions: (missionCardOptions: string[]) => void
}

export const CollectionContext = createContext<ICollectionContext>({
  ownedCards: [],
  ownedCardsMap: new Map(),
  updateCards: async (_) => {},
  selectedCardId: '',
  setSelectedCardId: () => {},
  selectedMissionCardOptions: [],
  setSelectedMissionCardOptions: () => {},
})
