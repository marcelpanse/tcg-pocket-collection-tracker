import { CircleHelp } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

interface Props {
  deckbuildingMode: boolean
  setDeckbuildingMode: (deckbuildingMode: boolean) => void
}
const DeckbuildingFilter: FC<Props> = ({ deckbuildingMode, setDeckbuildingMode }) => {
  const { t } = useTranslation('deckbuilding-filter')

  return (
    <div className="flex items-center space-x-2">
      <input type="checkbox" id="checkbox" checked={deckbuildingMode} onChange={() => setDeckbuildingMode(!deckbuildingMode)} className="w-5 h-5" />
      <label htmlFor="checkbox" className="text-lg">
        {t('deckbuildingModeLabel')}
      </label>
      <Tooltip id="deckbuildingMode" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
      <CircleHelp className="h-4 w-4" data-tooltip-id="deckbuildingMode" data-tooltip-content={t('deckbuildingModeTooltip')} />
    </div>
  )
}

export default DeckbuildingFilter
