import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { expansions } from '@/lib/CardsDB.ts'

interface Props {
  value: string
  onChange: (expansion: string) => void
}
const ExpansionsFilter: FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation('common/sets')

  return (
    <label className="flex items-baseline justify-between gap-5 px-3 my-auto border-1 border-neutral-700 rounded-md p-1 bg-neutral-800 text-neutral-400">
      <div className="text-sm">{t('expansion')}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[27px] text-sm">
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
