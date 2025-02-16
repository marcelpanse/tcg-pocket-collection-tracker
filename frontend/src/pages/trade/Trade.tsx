import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'
import { BuyingTokens } from './BuyingTokens'
import { ForTrade } from './ForTrade'
import { LookingFor } from './LookingFor'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function Trade() {
  const { user } = use(UserContext)

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="looking_for">
        <div className="mx-auto max-w-[900px]">
          <TabsList className="w-full m-auto mt-4 mb-8 flex-wrap h-auto border-2 border-slate-600 rounded-md">
            <TabsTrigger value="looking_for">Looking For</TabsTrigger>
            <TabsTrigger value="for_trade">For Trade</TabsTrigger>
            <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
          </TabsList>
        </div>
        <div className="max-w-auto mx-4 md:mx-8">
          <TabsContent value="looking_for">
            <LookingFor />
          </TabsContent>
          <TabsContent value="for_trade">
            <ForTrade />
          </TabsContent>
          <TabsContent value="buying_tokens">
            <BuyingTokens />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Trade
