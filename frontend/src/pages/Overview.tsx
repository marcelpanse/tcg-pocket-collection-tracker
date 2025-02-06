import { BarChartComponent } from '@/components/BarChart'
import { Progress } from '@/components/ui/progress'
import * as CardsDB from '@/lib/CardsDB.ts'
import type { CollectionRow, Expansion } from '@/types'
import type { Models } from 'appwrite'
import type { FC } from 'react'

interface GradientCardProps {
  title: string
  paragraph: string
  className?: string
}

//Names of the packs and their respective colors
//The varible should be chartData and the inicial from the names of the packs
//For example chartDataMCP for Mewtwo, Charizard, Pikachu

const chartDataMCP = [
  { packName: 'Mewtwo', percentage: 0.1, fill: '#986C88' },
  { packName: 'Charizard', percentage: 0.8, fill: '#E2711B' },
  { packName: 'Pikachu', percentage: 0.6, fill: '#EDC12A' },
]

const chartConfigMCP = {
  Mewtwo: {
    label: 'Mewtwo',
    color: 'hsl(var(--chart-1))',
  },
  Charizard: {
    label: 'Charizard',
    color: 'hsl(var(--chart-2))',
  },
  Pikachu: {
    label: 'Pikachu',
    color: 'hsl(var(--chart-3))',
  },
}

// const chartPieDataMCP = [
//   { packName: 'Mewtwo', percentage: 12, fill: '#986C88' },
//   { packName: 'Charizard', percentage: 30, fill: '#E2711B' },
//   { packName: 'Pikachu', percentage: 50, fill: '#EDC12A' },
//   { packName: 'Missing', percentage: 90, fill: '#9b9b9b' },
// ]
//
// const chartPieConfigMCP = {
//   Mewtwo: {
//     label: 'Mewtwo',
//     color: 'hsl(var(--chart-1))',
//   },
//   Charizard: {
//     label: 'Charizard',
//     color: 'hsl(var(--chart-2))',
//   },
//   Pikachu: {
//     label: 'Pikachu',
//     color: 'hsl(var(--chart-3))',
//   },
//   MissingCards: {
//     label: 'Missing Cards',
//     color: 'hsl(var(--chart-4))',
//   },
// }

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
}

export const Overview: FC<Props> = ({ user, ownedCards }) => {
  const ownedCardsCount = ownedCards.reduce((total, card) => total + card.amount_owned, 0)
  if (user) {
    return (
      <main className="min-h-screen p-8 max-w-7xl mx-auto fade-in-up">
        <section className="grid grid-cols-8 gap-6">
          <div className="p-8 aspect-square w-full col-span-8 lg:col-span-2 h-full border-2 border-solid border-gray-500 rounded-4xl flex-col flex items-center justify-center">
            <h2 className="text-2xl mb-2 text-center">You have</h2>
            <h1 className="text-7xl mb-3 text-balance text-center font-semibold">{ownedCards.length}</h1>
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

const ExpansionOverview = ({ ownedCards, expansion }: { ownedCards: CollectionRow[]; expansion: Expansion }) => {
  return (
    <>
      <h2 className="col-span-8 text-2xl">{expansion.name}</h2>
      <GradientCard
        title="Pikachu"
        paragraph="is the most probable pack to get a new card from among Mewtwo, Charizard, and Pikachu packs"
        className="col-span-8 lg:col-span-4 bg-gradient-to-br from-yellow-400/50 to-yellow-500/50"
      />
      <div className="sm:col-span-2 col-span-full">
        <BarChartComponent data={chartDataMCP} config={chartConfigMCP} footer="Example text" />
      </div>
      <div className="sm:col-span-2 col-span-full">
        <CompleteProgress title="Total cards" ownedCards={ownedCards} expansion={expansion} />
        {expansion.packs.length > 1 &&
          expansion.packs.map((pack) => <CompleteProgress key={pack} title={pack} ownedCards={ownedCards} expansion={expansion} pack={pack} />)}

        {/*<PieChartComponent*/}
        {/*  data={chartPieDataMCP}*/}
        {/*  config={chartPieConfigMCP}*/}
        {/*  title="Total cards"*/}
        {/*  description="Between packs Pikachu, Charizard and Mewtwo"*/}
        {/*  footer={`You have ${CardsDB.nrOfCardsOwned(ownedCards, expansion)}/${expansion.cards.length} cards`}*/}
        {/*/>*/}
      </div>
    </>
  )
}

const CompleteProgress = ({ title, ownedCards, expansion, pack }: { title: string; ownedCards: CollectionRow[]; expansion: Expansion; pack?: string }) => {
  const nrOfCardsOwned = CardsDB.nrOfCardsOwned(ownedCards, expansion, pack)
  const totalNrOfCards = CardsDB.totalNrOfCards(expansion, pack)

  return (
    <div className="mt-4">
      {title}
      <Progress value={nrOfCardsOwned} max={totalNrOfCards} />
      You have {nrOfCardsOwned}/{totalNrOfCards} cards
    </div>
  )
}

const GradientCard: FC<GradientCardProps> = ({ title, paragraph, className }) => {
  return (
    <div className={`${className} rounded-4xl flex flex-col tex items-center justify-center p-8`}>
      <header className="text-7xl font-semibold text-white">{title}</header>
      <p className="text-2xl text-white mt-2 text-center">{paragraph}</p>
    </div>
  )
}
