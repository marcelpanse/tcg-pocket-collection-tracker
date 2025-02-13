import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { allCards, expansions } from '@/lib/CardsDB'
import { Pack } from './components/Pack'

function Collection() {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="all">
        <div className="mx-auto max-w-[900px]">
          <TabsList className="w-full m-auto mt-4 mb-8 flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {expansions.map((expansion) => (
              <TabsTrigger key={`tab_trigger_${expansion.id}`} value={expansion.id}>
                {expansion.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mx-auto max-w-auto">
          <TabsContent value="all">
            <Pack cards={allCards} />
          </TabsContent>
          {expansions.map((expansion) => (
            <TabsContent value={expansion.id} key={`tab_content_${expansion.id}`}>
              <Pack key={`tab_content_${expansion.id}`} cards={expansion.cards} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

export default Collection
