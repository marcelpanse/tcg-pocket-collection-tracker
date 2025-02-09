import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { allCards, expansions } from '@/lib/CardsDB'
import { UserContext } from '@/lib/context/UserContext.ts'
import { use } from 'react'
import { Pack } from './components/Pack'

// TODO: Refactor that cards still show without a user, but prompts for a login if you are not logged in yet.
function Collection() {
  const { user } = use(UserContext)

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-y-4">
      <Tabs defaultValue="all">
        <TabsList className="m-auto mt-4 mb-8">
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
