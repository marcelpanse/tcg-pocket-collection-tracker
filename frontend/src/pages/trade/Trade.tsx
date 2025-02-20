import RarityFilter from '@/components/RarityFilter.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserContext } from '@/lib/context/UserContext'
import { use, useState } from 'react'
import { BuyingTokens } from './BuyingTokens'
import { ForTrade } from './ForTrade'
import { LookingFor } from './LookingFor'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function Trade() {
  const { user } = use(UserContext)
  const [rarityFilter, setRarityFilter] = useState<string[]>([])

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="looking_for">
        <div className="mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-4 p-8">
          <TabsList className="flex-grow m-auto flex-wrap h-auto border-2 border-slate-600 rounded-md">
            <TabsTrigger value="looking_for">Looking For</TabsTrigger>
            <TabsTrigger value="for_trade">For Trade</TabsTrigger>
            <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
          </TabsList>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
        </div>
        <div className="max-w-auto mx-4 md:mx-8">
          <TabsContent value="looking_for">
            <LookingFor rarityFilter={rarityFilter} />
          </TabsContent>
          <TabsContent value="for_trade">
            <ForTrade rarityFilter={rarityFilter} />
          </TabsContent>
          <TabsContent value="buying_tokens">
            <BuyingTokens rarityFilter={rarityFilter} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Trade
