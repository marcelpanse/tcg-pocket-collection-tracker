import { Cards } from '@/components/Cards.tsx'
import { CollectionCard } from '@/components/CollectionCard'
import type { Models } from 'appwrite'
import type { FC } from 'react'

interface Props {
  user: Models.User<Models.Preferences> | null
}

interface Pokemon {
  id: number
  image: string
  counter: number
}

export const Collection: FC<Props> = ({ user }) => {

  const pokemonExample: Pokemon = {
    id: 1,
    image: "https://assets.pokemon-zone.com/game-assets/CardPreviews/cPK_10_004000_00_DIALGAex_RR.webp?width=25&quality=100",
    counter: 0
  }

  if (user) {
    // TODO: Refactor that cards still show without a user, but prompts for a login if you are not logged in yet.
    return <Cards user={user} />
  }

  return (
    <ul className='max-w-7xl mx-auto grid grid-cols-5 gap-5'>
      {Array.from({ length: 20 }).map((_, index) => (
        <li key={index}>
          <CollectionCard id={pokemonExample.id} image={pokemonExample.image} counter={pokemonExample.counter} />
        </li>
      ))}
    </ul>
  )
}
