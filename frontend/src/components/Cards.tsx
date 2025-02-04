import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import type { CollectionRow } from '@/types'
import { ID, type Models } from 'appwrite'
import { type FC, useEffect, useState } from 'react'
import A1 from '../../assets/cards/A1.json'
import A1a from '../../assets/cards/A1a.json'
import A2 from '../../assets/cards/A2.json'
import PA from '../../assets/cards/P-A.json'
import type { Card as CardType } from '../types'

const a1Cards: CardType[] = A1 as unknown as CardType[]
const a2Cards: CardType[] = A2 as unknown as CardType[]
const a1aCards: CardType[] = A1a as unknown as CardType[]
const paCards: CardType[] = PA as unknown as CardType[]

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
      // await fetchCollection()
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

  const Card = ({ card }: { card: CardType }) => {
    const amountOwned = ownedCards.find((c) => c.card_id === card.id)?.amount_owned || 0
    return (
      <div className="flex flex-col items-center gap-y-4 w-fit border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 group">
        <img
          className={`${amountOwned === 0 ? 'grayscale' : ''} w-40 rounded-lg object-cover transform group-hover:scale-105 transition duration-200`}
          src={card?.image}
          alt={card?.name}
        />
        <div className="flex items-center gap-x-4 mt-2">
          <button
            type="button"
            onClick={() => updateCardCount(card.id, -1)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-400 transition duration-200 focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10z" />
            </svg>
          </button>
          <span className="text-lg font-semibold">{amountOwned}</span>
          <button
            type="button"
            onClick={() => updateCardCount(card.id, 1)}
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

  const Pack = ({ cards }: { cards: CardType[] }) => {
    return (
      <>
        <h2 className="text-center text-2xl font-bold my-5">{cards[0].set_details}</h2>
        <ul className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((card) => (
            <li key={card.id} className="mx-auto">
              <Card card={card} />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <Pack cards={a1Cards} />
      <Pack cards={a2Cards} />
      <Pack cards={a1aCards} />
      <Pack cards={paCards} />
    </>
  )
}
