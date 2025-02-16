import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FiltersContext, type RaritySet } from '@/lib/context/FiltersContext'
import { Rarity } from '@/types'
import { type Dispatch, type SetStateAction, use } from 'react'

interface Props {
  setRarityFilter?: Dispatch<SetStateAction<RaritySet>>
}

function RarityFilter({ setRarityFilter: inSetRarityFilter }: Props) {
  const { dispatch } = use(FiltersContext)
  const setRarityFilter = inSetRarityFilter ?? ((rarity: RaritySet) => dispatch({ type: 'SET_RARITY_FILTER', payload: rarity }))

  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      size="sm"
      onValueChange={(values: Rarity[]) => (values.length === 0 ? setRarityFilter('all') : setRarityFilter(new Set(values)))}
      className="justify-end shadow-none border-2 border-slate-600 rounded-md"
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
