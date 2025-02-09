import * as CardsDB from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { use, useMemo } from 'react'
import { ExpansionOverview } from './components/ExpansionOverview'

function Fallback() {
  return (
    <article className="mx-auto grid max-w-7xl gap-5">
      <section className="flex h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 p-10">
        <header className="mb-2 text-3xl">Welcome to</header>
        <h1 className="mb-5 text-balance text-center font-semibold text-5xl">TCG Pocket Collection Tracker</h1>
        <footer className="text-balance text-center text-xl">Work in progress, check back soon!</footer>
      </section>
      <section className="mx-auto h-full w-full max-w-screen-xl rounded-4xl border-2 border-gray-500 p-10 text-center lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-md sm:text-center">
          <h2 className="mb-4 font-extrabold text-3xl tracking-tight sm:text-4xl">Sign up to view your card statistics</h2>
          <p className="mx-auto mb-4 max-w-2xl sm:text-xl">To view your card statistics, please register or log in.</p>
          <p className="mx-auto max-w-2xl sm:text-xl">
            By registering, you can keep track of your collection, trade with other users, and access exclusive features.
          </p>
        </div>
      </section>
    </article>
  )
}

function Overview() {
  const { user } = use(UserContext)
  const { ownedCards } = use(CollectionContext)

  const ownedCardsCount = useMemo(() => ownedCards.reduce((total, card) => total + card.amount_owned, 0), [ownedCards])

  if (!user) {
    return <Fallback />
  }

  return (
    <main className="fade-in-up mx-auto min-h-screen max-w-7xl p-8">
      <section className="grid grid-cols-8 gap-6">
        <div className="col-span-8 flex aspect-square h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 border-solid p-8 lg:col-span-2">
          <h2 className="mb-2 text-center text-2xl">You have</h2>
          <h1 className="mb-3 text-balance text-center font-semibold text-7xl">{CardsDB.getNrOfCardsOwned(ownedCards)}</h1>
          <h2 className="text-balance text-center text-2xl">out of {CardsDB.getTotalNrOfCards()} unique cards</h2>
        </div>
        <div className="-order-1 col-span-8 flex h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 p-10 lg:order-none lg:col-span-4">
          <header className="mb-2 text-3xl">Welcome to</header>
          <h1 className="mb-5 text-balance text-center font-semibold text-5xl">TCG Pocket Collection Tracker</h1>
          <footer className="text-balance text-center text-xl">Work in progress, check back soon!</footer>
        </div>
        <div className="col-span-8 flex aspect-square h-full w-full flex-col items-center justify-center rounded-4xl border-2 border-gray-500 border-solid p-8 opacity-100 lg:col-span-2">
          <h2 className="mb-2 text-center text-2xl">You have</h2>
          <h1 className="mb-3 overflow-hidden truncate whitespace-nowrap text-balance text-center font-semibold text-7xl">{ownedCardsCount}</h1>
          <h2 className="text-balance text-center text-2xl">cards in Total</h2>
        </div>

        {CardsDB.expansions.map((expansion) => (
          <ExpansionOverview key={expansion.id} expansion={expansion} />
        ))}
      </section>
    </main>
  )
}

export default Overview
