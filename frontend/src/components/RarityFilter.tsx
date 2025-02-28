import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  rarityFilter: string[]
  setRarityFilter: (rarityFilter: string[]) => void
}
const RarityFilter: FC<Props> = ({ rarityFilter, setRarityFilter }) => {
  const { width } = useWindowDimensions()
  const { t } = useTranslation('rarity-filter')
  const isMobile = width < 768

  const Toggles = useMemo(
    () => (
      <ToggleGroup
        variant="outline"
        type="multiple"
        size="sm"
        value={rarityFilter}
        onValueChange={(value) => setRarityFilter(value)}
        className={`justify-end shadow-none border-2 border-slate-600 rounded-md ${isMobile ? 'flex-col' : 'flex-row'}`}
      >
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
        <ToggleGroupItem value="☆" aria-label="☆" className="text-yellow-500 hover:text-yellow-600 .dark:data-[state=on]:text-yellow-500">
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
    ),
    [rarityFilter, isMobile],
  )

  if (!isMobile) {
    return Toggles
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {t('filters')} ({rarityFilter.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32">{Toggles}</PopoverContent>
    </Popover>
  )
}

export default RarityFilter
