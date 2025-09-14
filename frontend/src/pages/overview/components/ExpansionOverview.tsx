import i18n from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { BarChartComponent } from '@/components/BarChart.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import { CompleteProgress } from '@/pages/overview/components/CompleteProgress.tsx'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import { useCollection } from '@/services/collection/useCollection'
import type { Expansion, Rarity } from '@/types'
import { Carousel } from './Carousel'

interface ExpansionOverviewProps {
  expansion: Expansion
  rarityFilter: Rarity[]
  numberFilter: number
  deckbuildingMode: boolean
}
export function ExpansionOverview({ expansion, rarityFilter, numberFilter, deckbuildingMode }: ExpansionOverviewProps) {
  const { data: ownedCards = [] } = useCollection()

  const { t } = useTranslation(['expansion-overview', 'common/sets', 'common/packs'])

  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

  const { highestProbabilityPack, chartData } = useMemo(() => {
    let { packs } = expansion

    if (packs.length > 1) {
      packs = packs.filter((pack) => pack.name !== 'everypack')
    }
    const chartData = packs.map((pack) => ({
      packName: t(pack.name, { ns: 'common/packs' }),
      percentage: CardsDB.pullRate({ ownedCards, expansion, pack, rarityFilter, numberFilter, deckbuildingMode }),
      fill: pack.color,
    }))

    const highestProbabilityPack = chartData.sort((a, b) => b.percentage - a.percentage)[0]

    return {
      highestProbabilityPack,
      chartData,
    }
  }, [ownedCards, expansion, rarityFilter, numberFilter, deckbuildingMode])

  return (
    <>
      <h2 className="ml-6 md:ml-0 mt-6 col-span-8 text-3xl flex items-center">
        <img
          src={`/images/sets/${i18n.language}/${expansion.id}.webp`}
          alt={`${expansion.id}`}
          className="mr-2 inline max-w-[80px]"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = `/images/sets/en-US/${expansion.id}.webp`
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
              <CompleteProgress
                title={t('totalCards')}
                expansion={expansion}
                rarityFilter={rarityFilter}
                numberFilter={numberFilter}
                deckbuildingMode={deckbuildingMode}
              />
              {expansion.packs.length > 1 &&
                expansion.packs.map((pack) => (
                  <CompleteProgress
                    key={pack.name}
                    rarityFilter={rarityFilter}
                    title={t(pack.name, { ns: 'common/packs' })}
                    expansion={expansion}
                    packName={pack.name}
                    numberFilter={numberFilter}
                    deckbuildingMode={deckbuildingMode}
                    barColor={pack.color}
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
            <CompleteProgress
              title={t('totalCards')}
              expansion={expansion}
              rarityFilter={rarityFilter}
              numberFilter={numberFilter}
              deckbuildingMode={deckbuildingMode}
            />
            {expansion.packs.length > 1 &&
              expansion.packs.map((pack) => (
                <CompleteProgress
                  key={pack.name}
                  rarityFilter={rarityFilter}
                  numberFilter={numberFilter}
                  title={t(pack.name, { ns: 'common/packs' })}
                  expansion={expansion}
                  packName={pack.name}
                  deckbuildingMode={deckbuildingMode}
                  barColor={pack.color}
                />
              ))}
          </div>
        </>
      )}
    </>
  )
}
