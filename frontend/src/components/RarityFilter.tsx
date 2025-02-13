import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { FC } from 'react'

interface Props {
  setRarityFilter: (rarityFilter: string[]) => void
}
const RarityFilter: FC<Props> = ({ setRarityFilter }) => {
  ///&[data-state="on"]
  return (
    <ToggleGroup variant="outline" type="multiple" size="sm" onValueChange={(value) => setRarityFilter(value)} className="justify-end shadow-none">
      <ToggleGroupItem value="◊" aria-label="◊" className="text-gray-400 hover:text-gray-500">
        ♢
      </ToggleGroupItem>
      <ToggleGroupItem value="◊◊" aria-label="◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value="◊◊◊" aria-label="◊◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value="◊◊◊◊" aria-label="◊◊◊◊" className="text-gray-400 hover:text-gray-500">
        ♢♢♢♢
      </ToggleGroupItem>
      <ToggleGroupItem value="☆" aria-label="☆" className="text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500">
        ☆
      </ToggleGroupItem>
      <ToggleGroupItem value="☆☆" aria-label="☆☆" className="text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500">
        ☆☆
      </ToggleGroupItem>
      <ToggleGroupItem value="☆☆☆" aria-label="☆☆☆" className="text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500">
        ☆☆☆
      </ToggleGroupItem>
      <ToggleGroupItem value="Crown Rare" aria-label="♛">
        👑
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export default RarityFilter
