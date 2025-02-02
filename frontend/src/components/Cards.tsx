import { ID, type Models } from 'appwrite'
import { type FC, useEffect, useState } from 'react'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '../lib/Auth.ts'
import type { CollectionRow } from '../types'

interface Props {
  user: Models.User<Models.Preferences>
}

export const Cards: FC<Props> = ({ user }) => {
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])

  useEffect(() => {
    fetchCollection()
  }, [])

  const fetchCollection = async () => {
    const db = await getDatabase()
    const { documents } = await db.listDocuments(DATABASE_ID, COLLECTION_ID)
    console.log('documents', documents)
    setOwnedCards(documents as unknown as CollectionRow[])
  }

  const updateCardCount = async (cardId: string, increment: number) => {
    console.log(`${cardId} button clicked`)
    const db = await getDatabase()
    const ownedCard = ownedCards.find((c) => c.card_id === cardId)

    if (ownedCard) {
      console.log('updating', ownedCard)
      ownedCard.amount_owned = Math.max(0, ownedCard.amount_owned + increment)
      setOwnedCards([...ownedCards])
      await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, { amount_owned: ownedCard.amount_owned })
      await fetchCollection()
    } else if (!ownedCard && increment > 0) {
      console.log('adding new card', cardId)
      await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        email: user.email,
        card_id: cardId,
        amount_owned: increment,
      })
      await fetchCollection()
    }
  }

  const Card = ({ cardId }: { cardId: string }) => {
    return (
      <div className="flex items-center gap-x-2">
        Card A01
        <button
          type="button"
          onClick={() => updateCardCount(cardId, -1)}
          className="cursor-pointer rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
            <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10z" />
          </svg>
        </button>
        <span>{ownedCards.find((c) => c.card_id === cardId)?.amount_owned || 0}</span>
        <button
          type="button"
          onClick={() => updateCardCount(cardId, 1)}
          className="cursor-pointer rounded-full bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <ul className="mt-8 space-y-2">
      <li>
        <Card cardId="A01" />
      </li>
      <li>
        <Card cardId="A02" />
      </li>
    </ul>
  )
}
