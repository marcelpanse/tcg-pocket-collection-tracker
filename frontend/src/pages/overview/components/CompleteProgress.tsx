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
  deckbuildingMode?: boolean
}

export function CompleteProgress({ title, expansion, packName, rarityFilter = [], numberFilter = 1, deckbuildingMode }: CompleteProgressProps) {
  const { ownedCards } = use(CollectionContext)
  const { t } = useTranslation('complete-progress')

  const nrOfCardsOwned = useMemo(() => {
    return getNrOfCardsOwned({ ownedCards, rarityFilter, numberFilter, expansion, packName, deckbuildingMode })
  }, [ownedCards, expansion, packName, rarityFilter, numberFilter, deckbuildingMode])

  const totalNrOfCards = useMemo(
    () => getTotalNrOfCards({ rarityFilter, expansion, packName, deckbuildingMode }),
    [rarityFilter, expansion, packName, deckbuildingMode],
  )
  const progressValue = useMemo(() => (nrOfCardsOwned / totalNrOfCards) * 100, [nrOfCardsOwned, totalNrOfCards])

  return (
    <div className="sm:mt-4">
      {title}
      <Progress value={progressValue || 100} />
      {t('youHave', { nCardsOwned: nrOfCardsOwned, nTotalCards: totalNrOfCards })}
    </div>
  )
}
