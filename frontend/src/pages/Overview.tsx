import type { Models } from 'appwrite'
import type { FC } from 'react'

interface Props {
  user: Models.User<Models.Preferences> | null
}

export const Overview: FC<Props> = ({ user }) => {
  if (user) {
    return (
      <div className="grid grid-cols-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Overview</h1>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Welcome to the TCGPCT!</p>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Here you can view your collection, trade with other users, and view the Pokedex.</p>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Click on the links above to get started!</p>
      </div>
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
