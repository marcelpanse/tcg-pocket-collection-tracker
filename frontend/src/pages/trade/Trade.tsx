import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Cards from './Cards'
import TradeSettings from './Settings'
import TradeOffers from './TradeOffers'

function Trade() {
  return (
    <Tabs className="flex flex-col mx-auto max-w-[900px]" defaultValue="offers">
      <TabsList className="gap-4 mb-6 rounded-lg border-b-1 border-neutral-700 border-solid dark:bg-transparent pb-2">
        <TabsTrigger className="text-md" value="cards">
          Cards
        </TabsTrigger>
        <TabsTrigger className="text-md" value="offers">
          Offers
        </TabsTrigger>
        <TabsTrigger className="text-md" value="settings">
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="cards">
        <Cards />
      </TabsContent>
      <TabsContent value="offers">
        <TradeOffers />
      </TabsContent>
      <TabsContent value="settings">
        <TradeSettings />
      </TabsContent>
    </Tabs>
  )
}

export default Trade
