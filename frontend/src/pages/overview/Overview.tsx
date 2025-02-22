import RarityFilter from '@/components/RarityFilter.tsx'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTitle } from '@/components/ui/alert.tsx'
import { getStorage } from '@/lib/Auth.ts'
import * as CardsDB from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { GradientCard } from '@/pages/overview/components/GradientCard.tsx'
import { Query } from 'appwrite'
import { Siren } from 'lucide-react'
import { use, useEffect, useMemo, useState } from 'react'
import { ExpansionOverview } from './components/ExpansionOverview'

interface Pack {
  packName: string
  percentage: number
  fill: string
}

const BUCKET_ID = '67b79b0d0008be153794'

function Overview() {
  const { ownedCards } = use(CollectionContext)
  const { user } = use(UserContext)

  const [highestProbabilityPack, setHighestProbabilityPack] = useState<Pack | undefined>()
  const [totals, setTotals] = useState<{ totalUsers: number }>({ totalUsers: 0 })
  const ownedCardsCount = useMemo(() => ownedCards.reduce((total, card) => total + card.amount_owned, 0), [ownedCards])
  const [rarityFilter, setRarityFilter] = useState<string[]>(() => {
    const savedRarityFilter = localStorage.getItem('rarityFilter')
    return savedRarityFilter ? JSON.parse(savedRarityFilter) : []
  })
  useEffect(() => {
    localStorage.setItem('rarityFilter', JSON.stringify(rarityFilter))
  }, [rarityFilter])

  useEffect(() => {
    const storage = getStorage()
    storage.listFiles(BUCKET_ID, [Query.equal('name', 'totals.json'), Query.limit(1)]).then((res) => {
      const file = getStorage().getFileView(
        res.files[0].bucketId, // bucketId
        res.files[0].$id, // fileId
      )
      fetch(file)
        .then((res) => res.json())
        .then((data) => {
          console.log('data', data)
          setTotals(data)
        })
    })
  }, [])

  useEffect(() => {
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
  }, [ownedCards, rarityFilter])

  return (
    <main className="fade-in-up">
      <article className="mx-auto max-w-7xl px-8">
        {ownedCards.length === 0 && (
          <Alert className="mb-8 border-2 border-slate-600 shadow-none">
            <Siren className="h-4 w-4" />
            <AlertTitle>You don't have any cards logged yet!</AlertTitle>
            <AlertDescription>Head over to the collection page to add your first card or hit the login button to create an account.</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 flex items-center gap-2">
          <p className="grow-1">
            {user ? 'Amazing, that you are part of the ' : 'Join the '} <strong>{totals.totalUsers}</strong> users in our community! 🎉
          </p>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
        </div>

        <section className="grid grid-cols-8 gap-6">
          <div className="col-span-8 flex h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-slate-600 border-solid p-4 sm:p-8 md:col-span-2">
            <h2 className="mb-2 text-center text-lg sm:text-2xl">You have</h2>
            <h1 className="mb-3 text-balance text-center font-semibold text-3xl sm:text-7xl">{CardsDB.getNrOfCardsOwned({ ownedCards, rarityFilter })}</h1>
            <h2 className="text-balance text-center text-lg sm:text-2xl">out of {CardsDB.getTotalNrOfCards({ rarityFilter })} unique cards</h2>
          </div>
          <GradientCard
            title={highestProbabilityPack?.packName || ''}
            packNames="all"
            percentage={highestProbabilityPack?.percentage || 0}
            className="col-span-8 md:col-span-4 col-start-1 md:col-start-3"
            backgroundColor={highestProbabilityPack?.fill}
          />
          <div className="col-span-8 flex h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-slate-600 border-solid p-4 sm:p-8 md:col-span-2">
            <h2 className="mb-2 text-center text-lg sm:text-2xl">You have</h2>
            <h1 className="mb-3 text-balance text-center font-semibold text-3xl sm:text-7xl">{ownedCardsCount}</h1>
            <h2 className="text-balance text-center text-lg sm:text-2xl">cards in total</h2>
          </div>
        </section>
      </article>
      <article className="mx-auto min-h-screen max-w-7xl sm:p-6 p-0 pt-6 grid grid-cols-8 gap-6">
        {CardsDB.expansions.map((expansion) => (
          <ExpansionOverview key={expansion.id} expansion={expansion} rarityFilter={rarityFilter} />
        ))}
      </article>
    </main>
  )
}

export default Overview
