import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  numberFilter: number
  setNumberFilter: (numberFilter: number) => void
  options: number[]
  labelKey?: string
}
const NumberFilter: FC<Props> = ({ numberFilter, setNumberFilter, options, labelKey = 'numberCards' }) => {
  const { t } = useTranslation('number-filter')

  return (
    <div className="px-3 py-1 border-2 border-slate-600 rounded-md">
      <label className="flex items-center gap-x-2 text-white/50 text-sm">
        <h2>{t(labelKey)}</h2>
        <select value={numberFilter} onChange={(e) => setNumberFilter(Number.parseInt(e.target.value))} className="p-1">
          {options.map((number) => (
            <option key={number} value={number} className="text-black">
              {number}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default NumberFilter
