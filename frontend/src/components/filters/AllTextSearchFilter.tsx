import { CircleHelp } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

interface Props {
  allTextSearch: boolean
  setAllTextSearch: (allTextSearch2: boolean) => void
}
const AllTextSearchFilter: FC<Props> = ({ allTextSearch, setAllTextSearch }) => {
  const { t } = useTranslation('search-input')

  return (
    <div className="flex items-center space-x-2 text-white/50">
      <input type="checkbox" id="checkbox" checked={allTextSearch} onChange={() => setAllTextSearch(!allTextSearch)} className="w-4 h-4" />
      <label htmlFor="checkbox" className="text-xs">
        {t('allTextLabel')}
      </label>
      <Tooltip id="allTextSearch" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
      <CircleHelp className="h-4 w-4" data-tooltip-id="allTextSearch" data-tooltip-content={t('allTextTooltip')} />
    </div>
  )
}

export default AllTextSearchFilter
