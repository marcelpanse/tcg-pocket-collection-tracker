import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { allCards, expansions } from '@/lib/CardsDB'
import { Pack } from './components/Pack'

function Collection() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-y-4 px-4">
      <Tabs defaultValue="all">
        <TabsList className="w-full m-auto mt-4 mb-8 flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {expansions.map((expansion) => (
            <TabsTrigger key={`tab_trigger_${expansion.id}`} value={expansion.id}>
              {expansion.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <Pack cards={allCards} />
        </TabsContent>
        {expansions.map((expansion) => (
          <TabsContent value={expansion.id} key={`tab_content_${expansion.id}`}>
            <Pack key={`tab_content_${expansion.id}`} cards={expansion.cards} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Collection
