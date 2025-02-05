import { PercentageBarChart } from '@/components/PercentageBarChart'
import type { CollectionRow } from '@/types'
import type { Models } from 'appwrite'
import type { FC } from 'react'

interface GradientCardProps {
  title: string
  paragraph: string
  gradientFrom: string
  gradientTo: string
}

const chartData = [
  { packName: 'Pack1', percentage: 0.1, fill: '#FF5733' }, // Color aleatorio
  { packName: 'Pack2', percentage: 0.5, fill: '#33FF57' }, // Color aleatorio
  { packName: 'Pack3', percentage: 0.8, fill: '#3357FF' }, // Color aleatorio
]

const chartConfig = {
  Pack1: {
    label: 'Pack 1',
    color: 'hsl(var(--chart-1))',
  },
  Pack2: {
    label: 'Pack 2',
    color: 'hsl(var(--chart-2))',
  },
  Pack3: {
    label: 'Pack 3',
    color: 'hsl(var(--chart-3))',
  },
}

const GradientCard: FC<GradientCardProps> = ({ title, paragraph, gradientFrom, gradientTo }) => {
  return (
    <div className={`col-span-5 bg-gradient-to-l from-[${gradientFrom}]/70 to-[${gradientTo}]/70 rounded-4xl flex flex-col items-center justify-center p-8`}>
      <header className="text-7xl font-semibold text-white">{title}</header>
      <p className="text-2xl text-white mt-2 text-center">{paragraph}</p>
    </div>
  )
}

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
}

export const Overview: FC<Props> = ({ user, ownedCards }) => {
  console.log('user', user)
  console.log('ownedCards', ownedCards)

  const ownedCardsCount = ownedCards.reduce((total, card) => total + card.amount_owned, 0)
  console.log('ownedCardsCount', ownedCardsCount)
  if (user) {
    return (
      <main className="min-h-screen p-8 max-w-[90rem] mx-auto ">
        <section className="grid grid-cols-8 gap-6">
          <div className="p-8 aspect-square w-full col-span-2 h-full opacity-100 border-2 border-solid border-gray-600 rounded-4xl flex-col flex items-center justify-center">
            <h2 className="text-2xl mb-2 text-center">You have</h2>
            <h1 className="text-7xl mb-3 text-balance text-center font-semibold">{ownedCards.length}</h1>
            <h2 className="text-2xl text-center text-balance">types of Pokemon</h2>
          </div>
          <div className="rounded-4xl w-full h-full col-span-4 p-10 flex flex-col items-center justify-center border-gray-600 border-2">
            <h1 className="text-5xl text-balance text-center font-semibold">TCG Pocket Collection Tracker</h1>
            <h2 className="text-center text-xl mt-5 text-balance">Work in progress, check back soon!</h2>
          </div>
          <div className="p-8 aspect-square w-full h-full col-span-2 opacity-100 border-2 border-solid border-gray-600 rounded-4xl flex-col flex items-center justify-center">
            <h2 className="text-2xl mb-2 text-center">You have</h2>
            <h1 className="text-7xl mb-3 text-balance text-center font-semibold">{ownedCardsCount}</h1>
            <h2 className="text-2xl text-center text-balance">cards in Total</h2>
          </div>
          <GradientCard
            title="Pikachu"
            paragraph="is the most probable pack to get a new card from among Mewtwo, Charizard, and Pikachu packs"
            gradientFrom="#B4470F"
            gradientTo="#EDC12A"
          />
          <div className="col-span-3">
            <PercentageBarChart data={chartData} config={chartConfig} />
          </div>
          <GradientCard
            title="Dialga"
            paragraph="is the most probable pack to get a new card from among Palkia and Dialga packs"
            gradientFrom="#6382EA"
            gradientTo="#03039F"
          />
          <div className="col-span-3">
            <PercentageBarChart data={chartData} config={chartConfig} />
          </div>
          <GradientCard
            title="Charizard"
            paragraph="is the most probable pack to get a new card from among Palkia and Dialga packs"
            gradientFrom="#E2711B"
            gradientTo="#940406"
          />
          <div className="col-span-3">
            <PercentageBarChart data={chartData} config={chartConfig} />
          </div>
        </section>
      </main>
    )
  }
  return (
    <section className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
      <div className="mx-auto max-w-screen-md sm:text-center">
        <h2 className="mb-4 text-3xl tracking-tight font-extrabold sm:text-4xl">Sign up to view your card statistics</h2>
        <p className="mx-auto mb-8 max-w-2xl md:mb-12 sm:text-xl">To view your card statistics, please register or log in.</p>
        <p className="mx-auto mb-8 max-w-2xl md:mb-12 sm:text-xl">
          By registering, you can keep track of your collection, trade with other users, and access exclusive features.
        </p>
      </div>
    </section>
  )
}
