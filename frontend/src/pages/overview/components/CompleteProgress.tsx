import { Progress } from '@/components/ui/progress.tsx'
import { getNrOfCardsOwned, getTotalNrOfCards } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { Expansion, Rarity } from '@/types'
import { use, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface CompleteProgressProps {
  title: string
  expansion: Expansion
  packName?: string
  rarityFilter?: Rarity[]
  numberFilter?: number
}

export function CompleteProgress({ title, expansion, packName, rarityFilter = [], numberFilter = 1 }: CompleteProgressProps) {
  const { ownedCards } = use(CollectionContext)
  const { t } = useTranslation('complete-progress')

  const nrOfCardsOwned = useMemo(() => {
    return getNrOfCardsOwned({ ownedCards, rarityFilter, numberFilter, expansion, packName })
  }, [ownedCards, expansion, packName, rarityFilter, numberFilter])

  const totalNrOfCards = useMemo(() => getTotalNrOfCards({ rarityFilter, expansion, packName }), [rarityFilter, expansion, packName])
  const progressValue = useMemo(() => (nrOfCardsOwned / totalNrOfCards) * 100, [nrOfCardsOwned, totalNrOfCards])

  return (
    <div className="sm:mt-4">
      {title}
      <Progress value={progressValue} />
      {t('youHave', { nCardsOwned: nrOfCardsOwned, nTotalCards: totalNrOfCards })}
    </div>
  )
}
