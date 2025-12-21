import { Heart, Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownFilter } from '@/components/Filters'
import Footer from '@/components/Footer.tsx'
import DeckbuildingFilter from '@/components/filters/DeckbuildingFilter'
import RarityFilter from '@/components/filters/RarityFilter'
import { RadialChart } from '@/components/RadialChart'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTitle } from '@/components/ui/alert.tsx'
import { expansions, getExpansionById } from '@/lib/CardsDB.ts'
import { getFilteredCards } from '@/lib/filters'
import { pullRate } from '@/lib/stats'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import { useCollection } from '@/services/collection/useCollection'
import { type Card, type CollectionRow, expansionIds, type Rarity } from '@/types'
import { ExpansionOverview } from './components/ExpansionOverview'

const expansionOptions = ['all', ...expansionIds.filter((id) => getExpansionById(id).openable)] as const
type ExpansionOption = (typeof expansionOptions)[number]

function getUniqueCount(cards: Card[]) {
  return new Set(cards.map((c) => c.internal_id)).size
}

function Overview() {
  const { data: ownedCards = new Map<number, CollectionRow>(), isLoading } = useCollection()

  const { t } = useTranslation(['pages/overview', 'filters', 'common/sets'])

  const [collectionCount, setCollectionCount] = useState('')
  const [usersCount, setUsersCount] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<ExpansionOption>(expansionOptions[1])

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

  const getLocalizedExpansion = (id: ExpansionOption) => {
    const expansion_name = id === 'all' ? 'all' : getExpansionById(id).name
    return t(expansion_name, { ns: 'common/sets' })
  }

  if (isLoading) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }

  return (
    <main>
      <article className="mx-auto max-w-7xl px-8">
        {ownedCards.size === 0 && (
          <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
            <Siren className="h-4 w-4" />
            <AlertTitle>{t('dontHaveCards.title')}</AlertTitle>
            <AlertDescription>{t('dontHaveCards.description')}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 flex items-center gap-2 flex-wrap">
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

        <section className="grid grid-cols-8 gap-4 sm:gap-6">
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8 mb-4 md:mb-0">
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
            className="col-span-8 md:col-span-4 col-start-1 md:col-start-3 mb-4 md:mb-0"
            backgroundColor={highestProbabilityPack?.fill}
          />
          <div className="col-span-8 md:col-span-2 flex flex-col items-center justify-center rounded-lg border-1 border-neutral-700 bg-neutral-800 border-solid p-3 sm:p-6 md:p-8">
            <h2 className="mb-1 text-center text-base sm:text-lg md:text-2xl">{t('youHave')}</h2>
            <h1 className="mb-2 text-balance text-center font-semibold text-2xl sm:text-3xl md:text-7xl">{ownedCardsCount()}</h1>
            <h2 className="text-balance text-center text-base sm:text-lg md:text-2xl">{t('cardsTotal')}</h2>
          </div>
        </section>
      </article>

      <article className="flex mx-auto max-w-7xl px-8 pt-10 -mb-4">
        <DropdownFilter
          label={t('expansion', { ns: 'common/sets' })}
          options={expansionOptions}
          value={expansionFilter}
          onChange={setExpansionFilter}
          show={getLocalizedExpansion}
        />
      </article>

      <article className="mx-auto max-w-7xl sm:p-6 p-0 pt-6 grid grid-cols-8 gap-6">
        {expansions
          .filter((expansion) => (expansionFilter === 'all' && expansion.openable) || expansionFilter === expansion.id)
          .map((expansion) => (
            <ExpansionOverview
              key={expansion.id}
              expansion={expansion}
              collectedCards={collectedCards.filter((c) => c.expansion === expansion.id)}
              wantedCards={wantedCards.filter((c) => c.expansion === expansion.id)}
              availableCards={availableCards.filter((c) => c.expansion === expansion.id)}
              deckbuildingMode={filters.deckbuildingMode}
            />
          ))}
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
