import * as CardsDB from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { CompleteProgress } from '@/pages/overview/components/CompleteProgress.tsx'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import type { Expansion, Rarity } from '@/types'
import { use, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { Carousel } from './Carousel'

interface ExpansionOverviewProps {
  expansion: Expansion
  rarityFilter: Rarity[]
  numberFilter: number
  deckbuildingMode: boolean
}
export function ExpansionOverview({ expansion, rarityFilter, numberFilter, deckbuildingMode }: ExpansionOverviewProps) {
  const { ownedCards } = use(CollectionContext)
  const { t } = useTranslation(['expansion-overview', 'common/sets', 'common/packs'])

  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

  const { highestProbabilityPack, chartData } = useMemo(() => {
    let { packs } = expansion

    if (packs.length > 1) {
      packs = packs.filter((pack) => pack.name !== 'everypack')
    }
    const chartData = packs.map((pack) => ({
      packName: pack.name,
      percentage: CardsDB.pullRate({ ownedCards, expansion, pack, rarityFilter, numberFilter, deckbuildingMode }),
      fill: pack.color,
    }))

    const highestProbabilityPack = chartData.length > 0 ? chartData.sort((a, b) => b.percentage - a.percentage)[0] : null

    return {
      highestProbabilityPack,
      chartData,
    }
  }, [ownedCards, expansion, rarityFilter, numberFilter, deckbuildingMode])

  return (
    <>
      <div className="col-span-full flex items-center justify-start ">
        <h2 className="col-span-8 text-4xl pl-8 flex items-center text-white">{t(expansion.name, { ns: 'common/sets' })}</h2>
        <img src={`/images/sets/${expansion.id}.webp`} alt={`${expansion.id}`} className="mx-4 inline" />
      </div>
      {isMobile ? (
        <div className="col-span-full">
          <Carousel padding="2rem">
            {!expansion.promo && highestProbabilityPack && (
              <GradientCard
                title={highestProbabilityPack.packName}
                packNames={chartData.map((cd) => t(cd.packName, { ns: 'common/packs' })).join(', ')}
                percentage={highestProbabilityPack.percentage}
                className="col-span-8 snap-start flex-shrink-0 w-full"
                backgroundColor={highestProbabilityPack.fill}
                otherPacks={chartData}
              />
            )}
            <div className="col-span-8 snap-start flex-shrink-0 w-full border border-white border-solid rounded-4xl p-4 sm:p-8">
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
          </Carousel>
        </div>
      ) : (
        <>
          {!expansion.promo && highestProbabilityPack && (
            <GradientCard
              title={highestProbabilityPack.packName}
              packNames={chartData.map((cd) => t(cd.packName, { ns: 'common/packs' })).join(', ')}
              percentage={highestProbabilityPack.percentage}
              className="col-span-4 lg"
              backgroundColor={highestProbabilityPack.fill}
              otherPacks={chartData}
            />
          )}
          <div className="col-span-4 flex flex-col p-3 sm:p-6 md:p-8">
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
