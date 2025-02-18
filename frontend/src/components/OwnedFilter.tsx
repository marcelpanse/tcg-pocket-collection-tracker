import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import type { FC } from 'react'

interface Props {
  ownedFilter: string
  setOwnedFilter: (ownedFilter: 'all' | 'owned' | 'missing') => void
}
const OwnedFilter: FC<Props> = ({ ownedFilter, setOwnedFilter }) => {
  return (
    <Tabs value={ownedFilter} onValueChange={(value) => setOwnedFilter(value as 'all' | 'owned' | 'missing')} className="w-50">
      <TabsList className="w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="missing">Missing</TabsTrigger>
        <TabsTrigger value="owned">Owned</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OwnedFilter
