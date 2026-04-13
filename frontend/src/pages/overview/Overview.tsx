import { Heart, Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownFilter } from '@/components/Filters'
import Footer from '@/components/Footer.tsx'
import DeckbuildingFilter from '@/components/filters/DeckbuildingFilter'
import RarityFilter from '@/components/filters/RarityFilter'
import { RadialChart } from '@/components/RadialChart'
import { Spinner } from '@/components/Spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTitle } from '@/components/ui/alert.tsx'
import { Progress } from '@/components/ui/progress'
import { expansions } from '@/lib/CardsDB.ts'
import { getFilteredCards } from '@/lib/filters'
import { pullRate } from '@/lib/stats'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import { useCollection } from '@/services/collection/useCollection'
import type { Card, CollectionRow, Rarity } from '@/types'

function getUniqueCount(cards: Card[]) {
  return new Set(cards.map((c) => c.internal_id)).size
}

function Overview() {
  const { data: ownedCards = new Map<number, CollectionRow>(), isLoading } = useCollection()

  const { t } = useTranslation(['pages/overview', 'filters', 'common/sets', 'expansion-overview'])

  const [collectionCount, setCollectionCount] = useState('')
  const [usersCount, setUsersCount] = useState('')

  const ownedCardsCount = () => {
    let total = 0
    ownedCards.forEach((card) => {
      total += card.amount_owned
    })
    return total
  }

  const [filters, setFilters] = useState<{ rarity: Rarity[]; number: number; deckbuildingMode: boolean }>(() => {
    const savedFilters = localStorage.getItem('overview-filters')
    return savedFilters ? JSON.parse(savedFilters) : { rarity: [], number: 1, deckbuildingMode: false }
  })

  useEffect(() => {
    fetch('https://vcwloujmsjuacqpwthee.supabase.co/storage/v1/object/public/stats/stats.json')
      .then((response) => response.json())
      .then((data) => {
        setCollectionCount(data.collectionCount)
        setUsersCount(data.usersCount)
      })
  }, [])

  useEffect(() => localStorage.setItem('overview-filters', JSON.stringify(filters)), [filters])

  const availableCards = getFilteredCards(filters, ownedCards)
  const collectedCards = ownedCards && getFilteredCards({ ...filters, minNumber: filters.number }, ownedCards)
  const wantedCards = ownedCards && getFilteredCards({ ...filters, maxNumber: filters.number - 1 }, ownedCards)

  const getHighestProbabilityPack = () => {
    let newHighestProbabilityPack: { packName: string; percentage: number; fill: string } | undefined
    const filteredExpansions = expansions.filter((expansion) => expansion.openable)
    for (const expansion of filteredExpansions) {
      const pullRates = expansion.packs
        .filter((p) => p.name !== 'everypack')
        .map((pack) => ({
          packName: pack.name,
          percentage: pullRate(wantedCards, expansion, pack, filters.deckbuildingMode),
          fill: pack.color,
        }))
      const highestProbabilityPackCandidate = pullRates.sort((a, b) => b.percentage - a.percentage)[0]
      if (highestProbabilityPackCandidate.percentage > (newHighestProbabilityPack?.percentage ?? -1)) {
        newHighestProbabilityPack = highestProbabilityPackCandidate
      }
    }
    return newHighestProbabilityPack
  }
  const highestProbabilityPack = getHighestProbabilityPack()

  if (isLoading) {
    return <Spinner size="lg" overlay />
  }

  return (
    <main>
      <article className="mx-auto max-w-7xl px-4">
        {ownedCards.size === 0 && (
          <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
            <Siren className="h-4 w-4" />
            <AlertTitle>{t('dontHaveCards.title')}</AlertTitle>
            <AlertDescription>{t('dontHaveCards.description')}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <RarityFilter
            rarityFilter={filters.rarity}
            setRarityFilter={(rarity) => setFilters((prev) => ({ ...prev, rarity }))}
            deckbuildingMode={filters.deckbuildingMode}
          />
          <DropdownFilter
            label={t('f-number.numberCards', { ns: 'filters' })}
            options={[1, 2, 3, 4, 5] as const}
            value={filters.number}
            onChange={(number) => setFilters((prev) => ({ ...prev, number }))}
          />
          <div className="grow" />
          <DeckbuildingFilter
            deckbuildingMode={filters.deckbuildingMode}
            setDeckbuildingMode={(deckbuildingMode) => setFilters((prev) => ({ ...prev, deckbuildingMode }))}
          />
        </div>

        <section className="grid grid-cols-8 gap-4 sm:gap-4">
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8">
            <h2 className="font-bold mb-4 text-center text-base sm:text-lg md:text-3xl">{t('uniqueCards')}</h2>
            <RadialChart
              value={availableCards.length === 0 ? 0 : getUniqueCount(collectedCards) / getUniqueCount(availableCards)}
              label={String(getUniqueCount(collectedCards))}
              sublabel={`/ ${getUniqueCount(availableCards)}`}
              color="#92C5FD"
              strokeWidth={24}
            />
            <h2 className="mt-6 text-balance text-center text-sm sm:text-md md:text-md">
              {filters.number === 1 ? t('numberOfCopies-single') : t('numberOfCopies-plural', { numberFilter: filters.number })}
            </h2>
          </div>
          <GradientCard
            title={highestProbabilityPack?.packName ?? ''}
            percentage={highestProbabilityPack?.percentage ?? 0}
            className="col-span-8 md:col-span-4 col-start-1 md:col-start-3"
            backgroundColor={highestProbabilityPack?.fill}
          />
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8">
            <h2 className="mb-1 text-center text-base sm:text-lg md:text-2xl">{t('youHave')}</h2>
            <h1 className="mb-2 text-balance text-center font-semibold text-2xl sm:text-3xl md:text-7xl">{ownedCardsCount()}</h1>
            <h2 className="text-balance text-center text-base sm:text-lg md:text-2xl">{t('cardsTotal')}</h2>
          </div>
        </section>

        <div className="w-full mx-auto mt-4 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 ">
          <table className="w-full [&>tr>td]:py-1 [&>tr>td]:px-2 [&>tr>th]:p-2 divide-y [&>tr]:divide-x divide-neutral-700 [&>tr]:divide-neutral-700">
            <tr>
              <th className="text-left">Expansion</th>
              <th className="text-left sm:min-w-48">Collected cards</th>
              <th className="text-left">New card</th>
            </tr>
            {expansions
              .toReversed()
              .filter((expansion) => expansion.openable)
              .map((expansion) => {
                const collected = collectedCards.filter((c) => c.expansion === expansion.id)
                const available = availableCards.filter((c) => c.expansion === expansion.id)
                const collectedPack = Object.groupBy(collected, (c) => c.pack)
                const availablePack = Object.groupBy(available, (c) => c.pack)
                return (
                  <>
                    <tr key={expansion.id}>
                      <td>{t(expansion.name, { ns: 'common/sets' })}</td>
                      <td>
                        <Progress
                          className="sm:inline-block sm:w-1/2 sm:mr-2"
                          value={(collected.length / available.length) * 100}
                          barColor={expansion.packs[0].color}
                        />
                        {collected.length} / {available.length}
                      </td>
                      <td>
                        {expansion.packs.length === 1 && (
                          <>{(100 * pullRate(wantedCards, expansion, expansion.packs[0], filters.deckbuildingMode)).toFixed(1)}%</>
                        )}
                      </td>
                    </tr>
                    {expansion.packs.length > 1 &&
                      expansion.packs.map((pack) => {
                        const nCardsOwned = (collectedPack[pack.name] ?? []).length
                        const nTotalCards = (availablePack[pack.name] ?? []).length
                        return (
                          <tr key={`${expansion.name}-${pack.name}`}>
                            <td className="!pl-8">{t(pack.name, { ns: 'common/packs' })}</td>
                            <td>
                              <Progress className="sm:inline-block sm:w-1/2 sm:mr-2" value={(nCardsOwned / nTotalCards) * 100} barColor={pack.color} />
                              {nCardsOwned} / {nTotalCards}
                            </td>
                            <td>{pack.name !== 'everypack' && <>{(100 * pullRate(wantedCards, expansion, pack, filters.deckbuildingMode)).toFixed(1)}%</>}</td>
                          </tr>
                        )
                      })}
                  </>
                )
              })}
          </table>
        </div>
      </article>

      {ownedCards.size > 0 && (
        <div className="mx-auto max-w-2xl my-8">
          <Alert className="border-1 border-neutral-700 shadow-none">
            <Heart className="h-4 w-4" />
            <AlertTitle>{t('stats.title')}</AlertTitle>
            <AlertDescription>{t('stats.description', { usersCount, collectionCount })}</AlertDescription>
          </Alert>
        </div>
      )}
      <Footer />
    </main>
  )
}

export default Overview
