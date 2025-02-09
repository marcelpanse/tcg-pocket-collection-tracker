import type { CollectionRow } from '@/types'
import { createContext } from 'react'

interface ICollectionContext {
  ownedCards: CollectionRow[]
  setOwnedCards: (cards: CollectionRow[]) => void
}

export const CollectionContext = createContext<ICollectionContext>({
  ownedCards: [],
  setOwnedCards: () => {},
})
