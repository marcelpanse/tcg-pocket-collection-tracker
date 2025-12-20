import i18n from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { BarChartComponent } from '@/components/BarChart.tsx'
import { pullRate } from '@/lib/stats'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import type { Card, Expansion } from '@/types'
import { Carousel } from './Carousel'
import { CompleteProgress } from './CompleteProgress'

interface ExpansionOverviewProps {
  expansion: Expansion
  collectedCards: Card[]
  wantedCards: Card[]
  availableCards: Card[]
  deckbuildingMode: boolean
}
export function ExpansionOverview({ expansion, collectedCards, availableCards, wantedCards, deckbuildingMode }: ExpansionOverviewProps) {
  const { t } = useTranslation(['expansion-overview', 'common/sets', 'common/packs'])

  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

  const { highestProbabilityPack, chartData } = useMemo(() => {
    let { packs } = expansion

    if (packs.length > 1) {
      packs = packs.filter((pack) => pack.name !== 'everypack')
    }
    const chartData = packs.map((pack) => ({
      packName: t(pack.name, { ns: 'common/packs' }),
      percentage: pullRate(wantedCards, expansion, pack, deckbuildingMode),
      fill: pack.color,
    }))

    const highestProbabilityPack = chartData.sort((a, b) => b.percentage - a.percentage)[0]

    return {
      highestProbabilityPack,
      chartData,
    }
  }, [wantedCards, expansion, deckbuildingMode])

  return (
    <>
      <h2 className="ml-6 md:ml-0 mt-6 col-span-8 text-3xl flex items-center">
        <img
          src={`/images/sets/${i18n.language}/${expansion.id}.webp`}
          alt={`${expansion.id}`}
          className="mr-2 inline max-w-[80px]"
          onError={(e) => {
            if (i18n.language !== 'en-US') {
              ;(e.target as HTMLImageElement).src = `/images/sets/en-US/${expansion.id}.webp`
            }
          }}
        />
        {t(expansion.name, { ns: 'common/sets' })}
      </h2>
      {isMobile ? (
        <div className="col-span-full">
          <Carousel padding="2rem">
            {!expansion.promo && (
              <>
                <GradientCard
                  title={highestProbabilityPack.packName}
                  percentage={highestProbabilityPack.percentage}
                  className="col-span-8 snap-start flex-shrink-0 w-full"
                  backgroundColor={highestProbabilityPack.fill}
                />
                <div className="col-span-8 snap-start flex-shrink-0 w-full">
                  <BarChartComponent title={t('probabilityNewCard')} data={chartData} />
                </div>
              </>
            )}
            <div className="col-span-8 snap-start flex-shrink-0 w-full border-1 border-neutral-700 border-solid rounded-lg p-4 sm:p-8">
              <CompleteProgress title={t('totalCards')} collected={collectedCards.length} available={availableCards.length} />
              {expansion.packs.length > 1 &&
                expansion.packs.map((pack) => (
                  <CompleteProgress
                    key={pack.name}
                    className="mt-4"
                    title={t(pack.name, { ns: 'common/packs' })}
                    barColor={pack.color}
                    collected={collectedCards.filter((c) => c.pack === pack.name).length}
                    available={availableCards.filter((c) => c.pack === pack.name).length}
                  />
                ))}
            </div>
          </Carousel>
        </div>
      ) : (
        <>
          {!expansion.promo && (
            <>
              <GradientCard
                title={highestProbabilityPack.packName}
                percentage={highestProbabilityPack.percentage}
                className="col-span-8 lg:col-span-4"
                backgroundColor={highestProbabilityPack.fill}
              />
              <div className="col-span-4 lg:col-span-2">
                <BarChartComponent title={t('probabilityNewCard')} data={chartData} />
              </div>
            </>
          )}
          <div className="col-span-4 lg:col-span-2">
            <CompleteProgress title={t('totalCards')} collected={collectedCards.length} available={availableCards.length} />
            {expansion.packs.length > 1 &&
              expansion.packs.map((pack) => (
                <CompleteProgress
                  key={pack.name}
                  className="mt-4"
                  title={t(pack.name, { ns: 'common/packs' })}
                  barColor={pack.color}
                  collected={collectedCards.filter((c) => c.pack === pack.name).length}
                  available={availableCards.filter((c) => c.pack === pack.name).length}
                />
              ))}
          </div>
        </>
      )}
    </>
  )
}
