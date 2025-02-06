import { LookingForTrade } from '@/components/LookingForTrade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import type { CollectionRow } from '@/types'
import { useEffect, useState } from 'react'
import A1 from '../../assets/cards/A1.json'
import A1a from '../../assets/cards/A1a.json'
import A2 from '../../assets/cards/A2.json'
import PA from '../../assets/cards/P-A.json'
import type { Card as CardType } from '../types'

const a1Cards: CardType[] = A1 as unknown as CardType[]
const a2Cards: CardType[] = A2 as unknown as CardType[]
const a1aCards: CardType[] = A1a as unknown as CardType[]
const paCards: CardType[] = PA as unknown as CardType[]

export function Trade() {
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

  const lookingForTradeCards = () => {
    const allCards = [...a1Cards, ...a2Cards, ...a1aCards, ...paCards]
    const missingCards = allCards.filter((ac) => ownedCards.findIndex((oc) => oc.card_id === ac.id) === -1)
    return missingCards
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <Tabs defaultValue="looking_for">
        <TabsList className="m-auto mt-4 mb-8">
          <TabsTrigger value="looking_for">Looking For</TabsTrigger>
          <TabsTrigger value="for_trade">For Trade</TabsTrigger>
          <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="looking_for">
          <LookingForTrade cards={lookingForTradeCards()} />
        </TabsContent>
        <TabsContent value="for_trade">
          <span>For Trade</span>
        </TabsContent>
        <TabsContent value="buying_tokens">
          <span>Buying Tokens</span>
        </TabsContent>
      </Tabs>
    </div>
  )
}
