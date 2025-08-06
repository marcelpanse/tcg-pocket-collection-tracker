import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  sortBy: string
  setSortBy: (sortBy: 'default' | 'recent') => void
}
const SortByRecent: FC<Props> = ({ sortBy, setSortBy }) => {
  const { t } = useTranslation('sort-by')
  return (
    <div className="px-3 py-1 border-1 border-neutral-700 rounded-md">
      <label className="flex items-center gap-x-2 text-white/50 text-sm">
        <h2>{t('sortBy')}</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'default' | 'recent')} className="p-1">
          <option value={'default'} className="text-black">
            {t('default')}
          </option>
          <option value={'recent'} className="text-black">
            {t('recent')}
          </option>
        </select>
      </label>
    </div>
  )
}

export default SortByRecent
