import PackFilter from '@/components/filters/PackFilter.tsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { expansions } from '@/lib/CardsDB.ts'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  expansionFilter: string
  setExpansionFilter: (expansionFilter: string) => void
  packFilter: string
  setPackFilter: (packFilter: string) => void
  showPacks?: boolean
}
const ExpansionsFilter: FC<Props> = ({ expansionFilter, setExpansionFilter, setPackFilter, packFilter, showPacks }) => {
  const { t } = useTranslation('common/sets')

  return (
    <div className="w-full flex flex-row gap-x-2 items-stretch">
      <Tabs
        value={expansionFilter}
        onValueChange={(value) => {
          setExpansionFilter(value)
          setPackFilter('all')
        }}
        className="grow-3"
      >
        <TabsList className="w-full flex-wrap h-full border-1 border-neutral-700 rounded-md justify-center content-start">
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          {expansions.map((expansion) => (
            <TabsTrigger key={`tab_trigger_${expansion.id}`} value={expansion.id}>
              <div className="flex flex-col items-center gap-1">
                <span>{t(expansion.name)}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {showPacks && <PackFilter packFilter={packFilter} setPackFilter={setPackFilter} expansion={expansionFilter} />}
    </div>
  )
}

export default ExpansionsFilter
