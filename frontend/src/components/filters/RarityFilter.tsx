import { type FC, useEffect } from 'react'
import { rarities as allRarities, type Rarity } from '@/types'
import { ToggleFilter } from '../Filters'
import { formatRarity } from '../utils'

interface Props {
  rarities?: readonly Rarity[]
  rarityFilter: Rarity[]
  setRarityFilter: (rarityFilter: Rarity[]) => void
  deckbuildingMode?: boolean
}

const basicRarities: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', 'P']

const RarityFilter: FC<Props> = ({ rarities, rarityFilter, setRarityFilter, deckbuildingMode }) => {
  useEffect(() => {
    if (deckbuildingMode) {
      setRarityFilter(rarityFilter.filter((rf) => basicRarities.includes(rf)))
    }
  }, [deckbuildingMode])
  const raritiesToUse: readonly Rarity[] = rarities ?? (deckbuildingMode ? basicRarities : allRarities)
  return <ToggleFilter options={raritiesToUse} value={rarityFilter} onChange={setRarityFilter} show={formatRarity} />
}

export default RarityFilter
