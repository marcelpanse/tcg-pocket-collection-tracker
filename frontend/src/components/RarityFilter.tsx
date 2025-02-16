import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FiltersContext, type RaritySet } from '@/lib/context/FiltersContext'
import { Rarity } from '@/types'
import { type Dispatch, type SetStateAction, use, useMemo } from 'react'

interface Props {
  setRarityFilter?: Dispatch<SetStateAction<RaritySet>>
}

function RarityFilter({ setRarityFilter: inSetRarityFilter }: Props) {
  const { filterState, setFilterState } = use(FiltersContext)
  const setRarityFilter =
    inSetRarityFilter ??
    ((rarity: RaritySet) =>
      setFilterState((draft) => {
        draft.rarityFilter = rarity
      }))

  const rarityFilterValue = useMemo(() => {
    if (typeof inSetRarityFilter !== 'undefined') {
      // The state is then not handled by context.
      return undefined
    }

    if (filterState.rarityFilter === 'all') {
      return []
    }

    return Array.from(filterState.rarityFilter)
  }, [filterState.rarityFilter])

  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      size="sm"
      value={rarityFilterValue}
      onValueChange={(values: Rarity[]) => (values.length === 0 ? setRarityFilter('all') : setRarityFilter(new Set(values)))}
      className="justify-between shadow-none border-2 border-slate-600 rounded-md [&>*]:flex-grow"
    >
      <ToggleGroupItem value={Rarity['◊']} aria-label="◊" className="text-gray-400 hover:text-gray-500">
        ♢
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['◊◊']} aria-label="◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['◊◊◊']} aria-label="◊◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['◊◊◊◊']} aria-label="◊◊◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['☆']} aria-label="☆" className="text-yellow-500 hover:text-yellow-600 .dark:data-[state=on]:text-yellow-500">
        ☆
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['☆☆']} aria-label="☆☆" className="text-yellow-500 hover:text-yellow-500">
        ☆☆
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity['☆☆☆']} aria-label="☆☆☆" className="text-yellow-500 hover:text-yellow-500">
        ☆☆☆
      </ToggleGroupItem>
      <ToggleGroupItem value={Rarity.CrownRare} aria-label="♛">
        👑
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export default RarityFilter
