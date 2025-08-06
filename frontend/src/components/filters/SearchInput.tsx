import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input.tsx'

let _searchDebounce: number | null = null

type Props = {
  setSearchValue: (searchValue: string) => void
  fullWidth?: boolean
}
const SearchInput: FC<Props> = ({ setSearchValue, fullWidth }) => {
  const { t } = useTranslation('search-input')
  return (
    <Input
      type="search"
      placeholder={t('search')}
      className={`w-full ${!fullWidth ? 'sm:w-32' : ''} border-2 h-[38px] bg-neutral-800`}
      style={{ borderColor: '#45556C' }}
      onChange={(e) => {
        if (_searchDebounce) {
          window.clearTimeout(_searchDebounce)
        }
        _searchDebounce = window.setTimeout(() => {
          setSearchValue(e.target.value)
        }, 500)
      }}
    />
  )
}

export default SearchInput
