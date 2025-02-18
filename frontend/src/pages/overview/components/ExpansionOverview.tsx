import { BarChartComponent } from '@/components/BarChart.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { CompleteProgress } from '@/pages/overview/components/CompleteProgress.tsx'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import type { Expansion } from '@/types'
import { use, useMemo } from 'react'

interface ExpansionOverviewProps {
  expansion: Expansion
  rarityFilter: string[]
}
export function ExpansionOverview({ expansion, rarityFilter }: ExpansionOverviewProps) {
  const { ownedCards } = use(CollectionContext)

  const { highestProbabilityPack, chartData } = useMemo(() => {
    let { packs } = expansion
    if (expansion.packs.length > 1) {
      packs = expansion.packs.filter((pack) => pack.name !== 'Every pack')
    }
    const chartData = packs.map((pack) => ({
      packName: pack.name.replace(' pack', '').replace('Every', 'Promo-A'),
      percentage: CardsDB.pullRate({ ownedCards: ownedCards, expansion: expansion, pack: pack, rarityFilter }),
      fill: pack.color,
    }))

    const highestProbabilityPack = chartData.sort((a, b) => b.percentage - a.percentage)[0]

    return {
      highestProbabilityPack,
      chartData,
    }
  }, [ownedCards, expansion, rarityFilter])

  return (
    <>
      <h2 className="col-span-8 text-2xl">{expansion.name}</h2>
      {!expansion.promo && (
        <>
          <GradientCard
            title={highestProbabilityPack.packName}
            packNames={chartData.map((cd) => cd.packName).join(', ')}
            percentage={highestProbabilityPack.percentage}
            className="col-span-8 lg:col-span-4"
            backgroundColor={highestProbabilityPack.fill}
          />
          <div className="col-span-full sm:col-span-2">
            <BarChartComponent title="Probability of getting new card per pack" data={chartData} />
          </div>
        </>
      )}
      <div className="col-span-full sm:col-span-2">
        <CompleteProgress title="Total cards" expansion={expansion} rarityFilter={rarityFilter} />
        {expansion.packs.length > 1 &&
          expansion.packs.map((pack) => (
            <CompleteProgress key={pack.name} rarityFilter={rarityFilter} title={pack.name} expansion={expansion} packName={pack.name} />
          ))}
      </div>
    </>
  )
}
