import { LookingForTrade } from '@/components/LookingForTrade'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { a1Cards, a1aCards, a2Cards, paCards } from '@/lib/CardsDB'
import type { CollectionRow } from '@/types'
import type { Models } from 'appwrite'

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
}

function Trade({ user, ownedCards }: Props) {
  const lookingForTradeCards = () => {
    const allCards = [...a1Cards, ...a2Cards, ...a1aCards, ...paCards]
    const missingCards = allCards.filter((ac) => ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1)
    return missingCards
  }

  if (user) {
    return (
      <div className="flex flex-col gap-y-4">
        <Tabs defaultValue="looking_for">
          <div className="max-w-[900px] mx-auto">
            <TabsList className="m-auto mt-4 mb-8">
              <TabsTrigger value="looking_for">Looking For</TabsTrigger>
              <TabsTrigger value="for_trade">For Trade</TabsTrigger>
              <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
            </TabsList>
          </div>
          <div className="max-w-auto mx-auto">
            <TabsContent value="looking_for">
              <LookingForTrade cards={lookingForTradeCards()} />
            </TabsContent>
            <TabsContent value="for_trade">
              <span>For Trade</span>
            </TabsContent>
            <TabsContent value="buying_tokens">
              <span>Buying Tokens</span>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  return null
}

export default Trade
