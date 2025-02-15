import { Input } from '@/components/ui/input.tsx'
import { debounce } from '@std/async/debounce'
import type { FC } from 'react'

const SEARCH_DEBOUNCE_MS = 500

type Props = {
  setSearchValue: (searchValue: string) => void
}

const SearchInput: FC<Props> = ({ setSearchValue }) => {
  return (
    <Input
      type="search"
      placeholder="Search..."
      className="w-full md:w-64 border-2 h-[38px]"
      style={{ borderColor: '#45556C' }}
      onChange={debounce((e) => setSearchValue(e.target.value), SEARCH_DEBOUNCE_MS)}
    />
  )
}

export default SearchInput
