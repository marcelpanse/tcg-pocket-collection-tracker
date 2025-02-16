import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { FiltersContext, type OwnedFilterMode } from '@/lib/context/FiltersContext'
import { cn } from '@/lib/utils'
import { use } from 'react'

interface Props {
  fullWidth?: boolean
}

function OwnedFilter({ fullWidth }: Props) {
  const { filterState, setFilterState } = use(FiltersContext)

  return (
    <Tabs
      value={filterState.ownedFilterMode}
      onValueChange={(value) =>
        setFilterState((draft) => {
          draft.ownedFilterMode = value as OwnedFilterMode
        })
      }
      className={fullWidth ? 'w-full' : 'w-50'}
    >
      <TabsList className={cn('w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md', fullWidth && '[&>*]:basis-1/3')}>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="missing">Missing</TabsTrigger>
        <TabsTrigger value="owned">Owned</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OwnedFilter
