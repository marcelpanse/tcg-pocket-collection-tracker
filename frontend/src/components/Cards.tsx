import type { CollectionRow } from '@/types'
import { ID, type Models } from 'appwrite'
import { type FC, useEffect, useState } from 'react'
import A1 from '../../assets/cards/A1.json'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '../lib/Auth.ts'
import type { Card as CardType } from '../types'

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
      await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
        amount_owned: ownedCard.amount_owned,
      })
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

  const A1_Cards: CardType[] = A1 as unknown as CardType[]

  const Card = ({ cardId }: { cardId: string }) => {
    const Card_info = A1_Cards.find((c) => c.id === cardId)
    return (
      <div className="flex flex-col items-center gap-y-4 w-fit border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 group">
        <img className="w-40 rounded-lg object-cover transform group-hover:scale-105 transition duration-200" src={Card_info?.image} alt={Card_info?.name} />
        <div className="flex items-center gap-x-4 mt-2">
          <button
            type="button"
            onClick={() => updateCardCount(cardId, -1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-400 transition duration-200 focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10z" />
            </svg>
          </button>
          <span className="text-lg font-semibold">{ownedCards.find((c) => c.card_id === cardId)?.amount_owned || 0}</span>
          <button
            type="button"
            onClick={() => updateCardCount(cardId, 1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-400 transition duration-200 focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
      {A1_Cards.map((card) => (
        <li key={card.id} className="mx-auto">
          <Card cardId={card.id} />
        </li>
      ))}
    </ul>
  )
}
