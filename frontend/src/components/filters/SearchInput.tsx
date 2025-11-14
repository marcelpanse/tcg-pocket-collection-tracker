import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input.tsx'
import { cn } from '@/lib/utils'

let _searchDebounce: number | null = null

type Props = {
  value?: string
  setValue: (searchValue: string) => void
  className?: string
}
const SearchInput: FC<Props> = ({ value, setValue, className }) => {
  const { t } = useTranslation('search-input')
  return (
    <Input
      type="search"
      placeholder={t('search')}
      className={cn('border-2 h-[38px] bg-neutral-800', className)}
      style={{ borderColor: '#45556C' }}
      defaultValue={value}
      onChange={(e) => {
        if (_searchDebounce) {
          window.clearTimeout(_searchDebounce)
        }
        _searchDebounce = window.setTimeout(() => {
          setValue(e.target.value)
        }, 500)
      }}
    />
  )
}

export default SearchInput
