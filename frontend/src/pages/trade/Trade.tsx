import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CollectionRow } from '@/types'
import type { Models } from 'appwrite'
import { BuyingTokens } from './BuyingTokens'
import { ForTrade } from './ForTrade'
import { LookingFor } from './LookingFor'

interface Props {
  user: Models.User<Models.Preferences> | null
  ownedCards: CollectionRow[]
}

function Trade({ user, ownedCards }: Props) {
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
              <LookingFor ownedCards={ownedCards} />
            </TabsContent>
            <TabsContent value="for_trade">
              <ForTrade ownedCards={ownedCards} />
            </TabsContent>
            <TabsContent value="buying_tokens">
              <BuyingTokens ownedCards={ownedCards} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  return null
}

export default Trade
