import { BarChartComponent } from '@/components/BarChart.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import { CompleteProgress } from '@/pages/overview/components/CompleteProgress.tsx'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import type { CollectionRow, Expansion } from '@/types'
import type { FC } from 'react'

interface ExpansionOverviewProps {
  ownedCards: CollectionRow[]
  expansion: Expansion
}
export const ExpansionOverview: FC<ExpansionOverviewProps> = ({ ownedCards, expansion }) => {
  let packs = expansion.packs
  if (expansion.packs.length > 1) {
    packs = expansion.packs.filter((pack) => pack.name !== 'Every pack')
  }
  const chartData = packs.map((pack) => ({
    packName: pack.name.replace(' pack', '').replace('Every', 'Promo-A'),
    percentage: CardsDB.pullRate(ownedCards, expansion, pack),
    fill: pack.color,
  }))

  const highestProbabilityPack = chartData.sort((a, b) => b.percentage - a.percentage)[0]

  return (
    <>
      <h2 className="col-span-8 text-2xl">{expansion.name}</h2>
      {!expansion.promo && (
        <GradientCard
          title={highestProbabilityPack.packName}
          paragraph={`is the most probable pack to get a new card from among ${chartData.map((cd) => cd.packName).join(', ')} packs`}
          className="col-span-8 lg:col-span-4"
          backgroundColor={highestProbabilityPack.fill}
        />
      )}
      {!expansion.promo && (
        <div className="sm:col-span-2 col-span-full">
          <BarChartComponent title="Probability of getting new card per pack" data={chartData} />
        </div>
      )}
      <div className="sm:col-span-2 col-span-full">
        <CompleteProgress title="Total cards" ownedCards={ownedCards} expansion={expansion} />
        {expansion.packs.length > 1 &&
          expansion.packs.map((pack) => (
            <CompleteProgress key={pack.name} title={pack.name} ownedCards={ownedCards} expansion={expansion} packName={pack.name} />
          ))}
      </div>
    </>
  )
}
