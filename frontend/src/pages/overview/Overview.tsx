import * as CardsDB from '@/lib/CardsDB.ts'
import type { CollectionRow } from '@/types'
import type { Models } from 'appwrite'
import type { FC } from 'react'
import { ExpansionOverview } from './components/ExpansionOverview'

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
}

const Overview: FC<Props> = ({ user, ownedCards }) => {
  const ownedCardsCount = ownedCards.reduce((total, card) => total + card.amount_owned, 0)
  if (user) {
    return (
      <main className="min-h-screen p-8 max-w-7xl mx-auto fade-in-up">
        <section className="grid grid-cols-8 gap-6">
          <div className="p-8 aspect-square w-full col-span-8 lg:col-span-2 h-full border-2 border-solid border-gray-500 rounded-4xl flex-col flex items-center justify-center">
            <h2 className="text-2xl mb-2 text-center">You have</h2>
            <h1 className="text-7xl mb-3 text-balance text-center font-semibold">{CardsDB.nrOfCardsOwned(ownedCards)}</h1>
            <h2 className="text-2xl text-center text-balance">out of {CardsDB.totalNrOfCards()} unique cards</h2>
          </div>
          <div className="rounded-4xl w-full h-full col-span-8 lg:col-span-4 p-10 flex flex-col items-center justify-center border-gray-500 border-2 -order-1 lg:order-none">
            <header className="text-3xl mb-2">Welcome to</header>
            <h1 className="text-5xl text-balance mb-5 text-center font-semibold">TCG Pocket Collection Tracker</h1>
            <footer className="text-center text-xl text-balance">Work in progress, check back soon!</footer>
          </div>
          <div className="p-8 aspect-square w-full h-full col-span-8 lg:col-span-2 opacity-100 border-2 border-solid border-gray-500 rounded-4xl flex-col flex items-center justify-center">
            <h2 className="text-2xl mb-2 text-center">You have</h2>
            <h1 className="text-7xl mb-3 text-balance text-center font-semibold truncate overflow-hidden whitespace-nowrap">{ownedCardsCount}</h1>
            <h2 className="text-2xl text-center text-balance">cards in Total</h2>
          </div>

          {CardsDB.expansions.map((expansion) => (
            <ExpansionOverview key={expansion.id} expansion={expansion} ownedCards={ownedCards} />
          ))}
        </section>
      </main>
    )
  }
  return (
    <article className="grid gap-5 max-w-7xl mx-auto">
      <section className="rounded-4xl w-full h-full p-10 flex flex-col items-center justify-center border-gray-500 border-2">
        <header className="text-3xl mb-2">Welcome to</header>
        <h1 className="text-5xl text-balance mb-5 text-center font-semibold">TCG Pocket Collection Tracker</h1>
        <footer className="text-center text-xl text-balance">Work in progress, check back soon!</footer>
      </section>
      <section className="w-full h-full text-center p-10 mx-auto max-w-screen-xl lg:py-16 lg:px-6 border-2 border-gray-500 rounded-4xl">
        <div className="mx-auto max-w-screen-md sm:text-center">
          <h2 className="mb-4 text-3xl tracking-tight font-extrabold sm:text-4xl">Sign up to view your card statistics</h2>
          <p className="mx-auto mb-4 max-w-2xl sm:text-xl">To view your card statistics, please register or log in.</p>
          <p className="mx-auto max-w-2xl sm:text-xl">
            By registering, you can keep track of your collection, trade with other users, and access exclusive features.
          </p>
        </div>
      </section>
    </article>
  )
}

export default Overview
