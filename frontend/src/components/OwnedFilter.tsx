import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { FiltersContext, type OwnedFilterMode } from '@/lib/context/FiltersContext'
import { use } from 'react'

function OwnedFilter() {
  const { state, dispatch } = use(FiltersContext)

  return (
    <Tabs value={state.ownedFilterMode} onValueChange={(value) => dispatch({ type: 'SET_OWNED_FILTER', payload: value as OwnedFilterMode })} className="w-50">
      <TabsList className="w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="missing">Missing</TabsTrigger>
        <TabsTrigger value="owned">Owned</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OwnedFilter
