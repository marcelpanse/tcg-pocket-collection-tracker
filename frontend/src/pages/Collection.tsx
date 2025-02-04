import { Cards } from '@/components/Cards.tsx'
import type { Models } from 'appwrite'
import type { FC } from 'react'

interface Props {
  user: Models.User<Models.Preferences> | null
}

export const Collection: FC<Props> = ({ user }) => {
  if (user) {
    // TODO: Refactor that cards still show without a user, but prompts for a login if you are not logged in yet.
    return <Cards user={user} />
  }

  return null
}
