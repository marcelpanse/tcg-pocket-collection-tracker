import RarityFilter from '@/components/RarityFilter.tsx'
import * as CardsDB from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import { use, useEffect, useMemo, useState } from 'react'
import { ExpansionOverview } from './components/ExpansionOverview'

function Fallback() {
  return (
    <article className="mx-auto grid max-w-7xl gap-5">
      <section className="flex h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 p-10">
        <header className="mb-2 text-3xl">Welcome to</header>
        <h1 className="mb-5 text-balance text-center font-semibold text-5xl">TCG Pocket Collection Tracker</h1>
      </section>
      <section className="mx-auto h-full w-full max-w-screen-xl rounded-4xl border-2 border-gray-500 p-10 text-center lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-md sm:text-center">
          <h2 className="mb-4 font-extrabold text-3xl tracking-tight sm:text-4xl">Sign up to view your card statistics</h2>
          <p className="mx-auto mb-4 max-w-2xl sm:text-xl">To view your card statistics, please log in.</p>
          <p className="mx-auto max-w-2xl sm:text-xl">
            By registering, you can keep track of your collection, trade with other users, and access exclusive features.
          </p>
        </div>
      </section>
    </article>
  )
}

interface Pack {
  packName: string
  percentage: number
  fill: string
}

function Overview() {
  const { user } = use(UserContext)
  const { ownedCards } = use(CollectionContext)

  const ownedCardsCount = useMemo(() => ownedCards.reduce((total, card) => total + card.amount_owned, 0), [ownedCards])
  const [highestProbabilityPack, setHighestProbabilityPack] = useState<Pack | undefined>()
  const [rarityFilter, setRarityFilter] = useState<string[]>([])

  useEffect(() => {
    if (ownedCards?.length > 0) {
      let newHighestProbabilityPack: Pack | undefined
      for (const expansion of CardsDB.expansions) {
        const pullRates = expansion.packs.map((pack) => ({
          packName: pack.name.replace(' pack', '').replace('Every', 'Promo-A'),
          percentage: CardsDB.pullRate({ ownedCards: ownedCards, expansion, pack, rarityFilter }),
          fill: pack.color,
        }))
        const highestProbabilityPackCandidate = pullRates.sort((a, b) => b.percentage - a.percentage)[0]
        if (highestProbabilityPackCandidate.percentage > (newHighestProbabilityPack?.percentage || 0)) {
          newHighestProbabilityPack = highestProbabilityPackCandidate
        }
      }

      setHighestProbabilityPack(newHighestProbabilityPack)
    }
  }, [ownedCards, rarityFilter])

  if (!user) {
    return <Fallback />
  }

  return (
    <main className="fade-in-up mx-auto min-h-screen max-w-7xl p-8">
      <div className="mb-8">
        <RarityFilter setRarityFilter={setRarityFilter} />
      </div>

      <section className="grid grid-cols-8 gap-6">
        <div className="col-span-8 flex aspect-square h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 border-solid p-8 lg:col-span-2">
          <h2 className="mb-2 text-center text-2xl">You have</h2>
          <h1 className="mb-3 text-balance text-center font-semibold text-7xl">{CardsDB.getNrOfCardsOwned({ ownedCards, rarityFilter })}</h1>
          <h2 className="text-balance text-center text-2xl">out of {CardsDB.getTotalNrOfCards({ rarityFilter })} unique cards</h2>
        </div>
        <GradientCard
          title={highestProbabilityPack?.packName || ''}
          packNames="all"
          percentage={highestProbabilityPack?.percentage || 0}
          className="col-span-8 lg:col-span-4 col-start-1 lg:col-start-3"
          backgroundColor={highestProbabilityPack?.fill}
        />
        <div className="col-span-8 flex aspect-square h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 border-solid p-8 opacity-100 lg:col-span-2">
          <h2 className="mb-2 text-center text-2xl">You have</h2>
          <h1 className="mb-3 overflow-hidden truncate whitespace-nowrap text-balance text-center font-semibold text-7xl">{ownedCardsCount}</h1>
          <h2 className="text-balance text-center text-2xl">cards in Total</h2>
        </div>

        {CardsDB.expansions.map((expansion) => (
          <ExpansionOverview key={expansion.id} expansion={expansion} rarityFilter={rarityFilter} />
        ))}
      </section>
    </main>
  )
}

export default Overview
