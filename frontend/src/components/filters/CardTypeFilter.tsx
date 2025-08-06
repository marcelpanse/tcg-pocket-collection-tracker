import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'
import { type CardType, cardTypes } from '@/types'

interface Props {
  cardTypeFilter: CardType[]
  setCardTypeFilter: (cardTypeFilter: CardType[]) => void
  collapse?: boolean
}
const CardTypeFilter: FC<Props> = ({ cardTypeFilter, setCardTypeFilter, collapse }) => {
  const { t } = useTranslation('card-type-filter')

  const Toggles = useMemo(
    () => (
      <ToggleGroup
        variant="outline"
        type="multiple"
        size="sm"
        value={cardTypeFilter}
        onValueChange={(value: CardType[]) => {
          setCardTypeFilter(value)
        }}
        className={`justify-center shadow-none border-1 border-neutral-700 rounded-md flex-wrap ${collapse ? 'flex-col' : 'flex-row'}`}
      >
        {cardTypes
          .filter((type) => type !== '' && type !== 'trainer')
          .map((type) => (
            <ToggleGroupItem key={type} value={type} aria-label={type} className="text-gray-400 hover:text-gray-500 px-1">
              <img src={`/images/energy/${type}.webp`} alt={type} className="h-4" />
            </ToggleGroupItem>
          ))}
        <ToggleGroupItem value="trainer" aria-label="trainer" className="text-gray-400 hover:text-gray-500 px-1">
          T
        </ToggleGroupItem>
      </ToggleGroup>
    ),
    [cardTypeFilter, collapse],
  )

  if (!collapse) {
    return Toggles
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {t('filters')} ({cardTypeFilter.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32">{Toggles}</PopoverContent>
    </Popover>
  )
}

export default CardTypeFilter
