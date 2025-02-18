import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { expansions } from '@/lib/CardsDB.ts'
import { FiltersContext } from '@/lib/context/FiltersContext'
import { use } from 'react'

function ExpansionsFilter() {
  const { filterState, setFilterState } = use(FiltersContext)

  return (
    <Tabs
      value={filterState.expansionFilter}
      onValueChange={(value) =>
        setFilterState((draft) => {
          draft.expansionFilter = value
        })
      }
      className="w-full"
    >
      <TabsList className="w-full flex-wrap h-auto lg:h-[40px] border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">All</TabsTrigger>
        {expansions.map((expansion) => (
          <TabsTrigger key={`tab_trigger_${expansion.id}`} value={expansion.id}>
            {expansion.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default ExpansionsFilter
