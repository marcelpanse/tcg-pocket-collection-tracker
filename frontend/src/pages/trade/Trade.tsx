import NumberFilter from '@/components/NumberFilter'
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
  const [minCards, setMinCards] = useState<number>(0)
  const [currentTab, setCurrentTab] = useState('looking_for')

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs
        defaultValue={currentTab}
        onValueChange={(value) => {
          switch (value) {
            case 'looking_for':
              setMinCards(0)
              break
            case 'for_trade':
              setMinCards(2)
              break
            case 'buying_tokens':
              setMinCards(3)
              break
          }
          setCurrentTab(value)
        }}
      >
        <div className="mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-4 p-8">
          <TabsList className="flex-grow m-auto flex-wrap h-auto border-2 border-slate-600 rounded-md">
            <TabsTrigger value="looking_for">Looking For</TabsTrigger>
            <TabsTrigger value="for_trade">For Trade</TabsTrigger>
            <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
          </TabsList>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
          <NumberFilter
            numberFilter={minCards}
            setNumberFilter={setMinCards}
            options={[0, 1, 2, 3, 4, 5]}
            labelKey={currentTab === 'looking_for' ? 'maxNum' : 'minNum'}
          />
        </div>
        <div className="max-w-auto mx-4 md:mx-8">
          <TabsContent value="looking_for">
            <LookingFor rarityFilter={rarityFilter} minCards={minCards} />
          </TabsContent>
          <TabsContent value="for_trade">
            <ForTrade rarityFilter={rarityFilter} minCards={minCards} />
          </TabsContent>
          <TabsContent value="buying_tokens">
            <BuyingTokens rarityFilter={rarityFilter} minCards={minCards} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Trade
