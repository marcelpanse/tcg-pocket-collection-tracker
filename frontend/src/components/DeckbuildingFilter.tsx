import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

interface Props {
  deckbuildingMode: boolean
  setDeckbuildingMode: (deckbuildingMode: boolean) => void
}
const DeckbuildingFilter: FC<Props> = ({ deckbuildingMode, setDeckbuildingMode }) => {
  const { t } = useTranslation('deckbuilding-filter')
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  return (
    <div className="flex items-center space-x-2">
      <input type="checkbox" id="checkbox" checked={deckbuildingMode} onChange={() => setDeckbuildingMode(!deckbuildingMode)} className="w-5 h-5" />
      <label htmlFor="checkbox" className="text-lg" data-tooltip-id="deckbuildingMode" data-tooltip-content={t('deckbuildingModeTooltip')}>
        {t('deckbuildingModeLabel')}
      </label>
      {!isMobile && <Tooltip id="deckbuildingMode" style={{ maxWidth: '300px', whiteSpace: 'normal' }} />}
    </div>
  )
}

export default DeckbuildingFilter
