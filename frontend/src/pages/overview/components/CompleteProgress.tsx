import { Progress } from '@/components/ui/progress.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import type { CollectionRow, Expansion } from '@/types'
import type { FC } from 'react'

interface CompleteProgressProps {
  title: string
  ownedCards: CollectionRow[]
  expansion: Expansion
  packName?: string
}
export const CompleteProgress: FC<CompleteProgressProps> = ({ title, ownedCards, expansion, packName }) => {
  const nrOfCardsOwned = CardsDB.nrOfCardsOwned(ownedCards, expansion, packName)
  const totalNrOfCards = CardsDB.totalNrOfCards(expansion, packName)

  return (
    <div className="mt-4">
      {title}
      <Progress value={(nrOfCardsOwned / totalNrOfCards) * 100} />
      You have {nrOfCardsOwned}/{totalNrOfCards} cards
    </div>
  )
}
