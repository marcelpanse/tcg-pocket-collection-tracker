import { Progress } from '@/components/ui/progress.tsx'
import { getNrOfCardsOwned, getTotalNrOfCards } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { Expansion } from '@/types'
import { use, useMemo } from 'react'

interface CompleteProgressProps {
  title: string
  expansion: Expansion
  packName?: string
}

export function CompleteProgress({ title, expansion, packName }: CompleteProgressProps) {
  const { ownedCards } = use(CollectionContext)
  const nrOfCardsOwned = useMemo(() => getNrOfCardsOwned(ownedCards, expansion, packName), [ownedCards, expansion, packName])
  const totalNrOfCards = useMemo(() => getTotalNrOfCards(expansion, packName), [expansion, packName])
  const progressValue = useMemo(() => (nrOfCardsOwned / totalNrOfCards) * 100, [nrOfCardsOwned, totalNrOfCards])

  return (
    <div className="mt-4">
      {title}
      <Progress value={progressValue} />
      You have {nrOfCardsOwned}/{totalNrOfCards} cards
    </div>
  )
}
