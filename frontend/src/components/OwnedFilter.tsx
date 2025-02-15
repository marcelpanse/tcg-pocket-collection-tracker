import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { FiltersContext } from '@/lib/context/FiltersContext'
import { use } from 'react'

function OwnedFilter() {
  const { ownedFilterMode, setOwnedFilterMode } = use(FiltersContext)

  return (
    <Tabs value={ownedFilterMode} onValueChange={(value) => setOwnedFilterMode(value as 'all' | 'owned' | 'missing')} className="w-50">
      <TabsList className="w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="missing">Missing</TabsTrigger>
        <TabsTrigger value="owned">Owned</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OwnedFilter
