import { expansions } from '@/lib/CardsDB.ts'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  expansionFilter: string
  onChange: (expansion: string) => void
  className?: string
}
const ExpansionsFilter: FC<Props> = ({ expansionFilter, onChange }) => {
  const { t } = useTranslation('common/sets')

  return (
    <label className="flex items-baseline justify-between gap-5 px-3 my-auto border-1 border-neutral-700 rounded-md p-1 bg-neutral-800 text-neutral-400">
      <h2 className="h-full">Expansion</h2>
      <select value={expansionFilter} onChange={(e) => onChange(e.target.value)} className="min-h-[2rem]">
        <option value="all">{t('all')}</option>
        {expansions.map((expansion) => (
          <option key={expansion.id} value={expansion.id}>
            {t(expansion.name)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default ExpansionsFilter
