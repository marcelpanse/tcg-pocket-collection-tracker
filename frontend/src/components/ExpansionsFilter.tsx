import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { expansions } from '@/lib/CardsDB.ts'
import type { FC } from 'react'

interface Props {
  expansionFilter: string
  setExpansionFilter: (expansionFilter: string) => void
}
const ExpansionsFilter: FC<Props> = ({ expansionFilter, setExpansionFilter }) => {
  return (
    <Tabs value={expansionFilter} onValueChange={(value) => setExpansionFilter(value)} className="w-full">
      <TabsList className="w-full flex-wrap h-auto lg:h-10">
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
