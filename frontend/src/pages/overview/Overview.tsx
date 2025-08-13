import { Heart, Siren } from 'lucide-react'
import { use, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DeckbuildingFilter from '@/components/filters/DeckbuildingFilter'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import { RadialChart } from '@/components/RadialChart'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTitle } from '@/components/ui/alert.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import { expansions } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import type { Rarity } from '@/types'
import { BlogOverview } from './components/BlogOverview'
import { ExpansionOverview } from './components/ExpansionOverview'

interface Pack {
  packName: string
  percentage: number
  fill: string
}

function Overview() {
  const { ownedCards } = use(CollectionContext)
  const { t } = useTranslation('pages/overview')

  const [highestProbabilityPack, setHighestProbabilityPack] = useState<Pack | undefined>()
  const [collectionCount, setCollectionCount] = useState('')
  const [usersCount, setUsersCount] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>(expansions[expansions.length - 2].id)

  const ownedCardsCount = useMemo(() => ownedCards.reduce((total, card) => total + card.amount_owned, 0), [ownedCards])

  const [rarityFilter, setRarityFilter] = useState<Rarity[]>(() => {
    const savedRarityFilter = localStorage.getItem('rarityFilter')
    return savedRarityFilter ? JSON.parse(savedRarityFilter) : []
  })
  const [numberFilter, setNumberFilter] = useState(() => {
    const savedNumberFilter = localStorage.getItem('numberFilter')
    return savedNumberFilter ? Number.parseInt(savedNumberFilter) : 1
  })
  const [deckbuildingMode, setDeckbuildingMode] = useState(() => {
    const savedDeckbuildingFilter = localStorage.getItem('deckbuildingFilter')
    return savedDeckbuildingFilter === 'true'
  })

  const totalUniqueCards = CardsDB.getTotalNrOfCards({ rarityFilter, deckbuildingMode })

  useEffect(() => {
    fetch('https://vcwloujmsjuacqpwthee.supabase.co/storage/v1/object/public/stats/stats.json')
      .then((response) => response.json())
      .then((data) => {
        setCollectionCount(data.collectionCount)
        setUsersCount(data.usersCount)
      })
  }, [])

  useEffect(() => {
    localStorage.setItem('rarityFilter', JSON.stringify(rarityFilter))
    localStorage.setItem('numberFilter', numberFilter.toString())
    localStorage.setItem('deckbuildingFilter', JSON.stringify(deckbuildingMode))
  }, [rarityFilter, numberFilter, deckbuildingMode])

  useEffect(() => {
    let newHighestProbabilityPack: Pack | undefined
    const filteredExpansions = CardsDB.expansions.filter((expansion) => !expansion.promo)
    for (const expansion of filteredExpansions) {
      const pullRates = expansion.packs
        .filter((p) => p.name !== 'everypack')
        .map((pack) => ({
          packName: pack.name,
          percentage: CardsDB.pullRate({ ownedCards, expansion, pack, rarityFilter, numberFilter, deckbuildingMode }),
          fill: pack.color,
        }))
      const highestProbabilityPackCandidate = pullRates.sort((a, b) => b.percentage - a.percentage)[0]
      if (highestProbabilityPackCandidate.percentage > (newHighestProbabilityPack?.percentage ?? 0)) {
        newHighestProbabilityPack = highestProbabilityPackCandidate
      }
    }

    setHighestProbabilityPack(newHighestProbabilityPack)
  }, [ownedCards, rarityFilter, numberFilter, deckbuildingMode])

  return (
    <main className="fade-in-up">
      <article className="mx-auto max-w-7xl px-8">
        {ownedCards.length === 0 && (
          <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
            <Siren className="h-4 w-4" />
            <AlertTitle>{t('dontHaveCards.title')}</AlertTitle>
            <AlertDescription>{t('dontHaveCards.description')}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 flex items-center gap-2 flex-wrap">
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} deckbuildingMode={deckbuildingMode} />
          <NumberFilter numberFilter={numberFilter} setNumberFilter={setNumberFilter} options={[1, 2, 3, 4, 5]} />
          <div className="grow" />
          <DeckbuildingFilter deckbuildingMode={deckbuildingMode} setDeckbuildingMode={setDeckbuildingMode} />
        </div>

        <section className="grid grid-cols-8 gap-4 sm:gap-6">
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8 mb-4 md:mb-0">
            <h2 className="font-bold mb-4 text-center text-base sm:text-lg md:text-3xl">{t('uniqueCards')}</h2>
            <RadialChart
              value={totalUniqueCards === 0 ? 0 : CardsDB.getNrOfCardsOwned({ ownedCards, rarityFilter, numberFilter, deckbuildingMode }) / totalUniqueCards}
              label={`${CardsDB.getNrOfCardsOwned({ ownedCards, rarityFilter, numberFilter, deckbuildingMode })}`}
              sublabel={`/ ${totalUniqueCards}`}
              color="#92C5FD"
              strokeWidth={24}
            />
            <h2 className="mt-6 text-balance text-center text-sm sm:text-md md:text-md">
              {numberFilter === 1 ? t('numberOfCopies-single') : t('numberOfCopies-plural', { numberFilter: numberFilter })}
            </h2>
          </div>
          <GradientCard
            title={highestProbabilityPack?.packName ?? ''}
            percentage={highestProbabilityPack?.percentage ?? 0}
            className="col-span-8 md:col-span-4 col-start-1 md:col-start-3 mb-4 md:mb-0"
            backgroundColor={highestProbabilityPack?.fill}
          />
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8">
            <h2 className="mb-1 text-center text-base sm:text-lg md:text-2xl">{t('youHave')}</h2>
            <h1 className="mb-2 text-balance text-center font-semibold text-2xl sm:text-3xl md:text-7xl">{ownedCardsCount}</h1>
            <h2 className="text-balance text-center text-base sm:text-lg md:text-2xl">{t('cardsTotal')}</h2>
          </div>
        </section>
      </article>

      <BlogOverview />

      <article className="flex mx-auto max-w-7xl px-8 pt-10 -mb-4">
        <ExpansionsFilter value={expansionFilter} onChange={setExpansionFilter} />
      </article>

      <article className="mx-auto max-w-7xl sm:p-6 p-0 pt-6 grid grid-cols-8 gap-6">
        {CardsDB.expansions
          .filter((expansion) => expansionFilter === 'all' || expansionFilter === expansion.id)
          .map((expansion) => (
            <ExpansionOverview
              key={expansion.id}
              expansion={expansion}
              rarityFilter={rarityFilter}
              numberFilter={numberFilter}
              deckbuildingMode={deckbuildingMode}
            />
          ))}
      </article>

      {ownedCards.length > 0 && (
        <div className="mx-auto max-w-2xl my-8">
          <Alert className="border-1 border-neutral-700 shadow-none">
            <Heart className="h-4 w-4" />
            <AlertTitle>{t('stats.title')}</AlertTitle>
            <AlertDescription>{t('stats.description', { usersCount, collectionCount })}</AlertDescription>
          </Alert>
        </div>
      )}
    </main>
  )
}

export default Overview
