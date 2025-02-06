import type { CollectionRow } from '@/types'
import type { Models } from 'appwrite'
import type { FC } from 'react'
import { Cards } from './components/Cards.tsx'

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
  setOwnedCards: (cards: CollectionRow[]) => void
}

export const Collection: FC<Props> = ({ user, ownedCards, setOwnedCards }) => {
  if (user) {
    // TODO: Refactor that cards still show without a user, but prompts for a login if you are not logged in yet.
    return <Cards user={user} ownedCards={ownedCards} setOwnedCards={setOwnedCards} />
  }

  return null
}
