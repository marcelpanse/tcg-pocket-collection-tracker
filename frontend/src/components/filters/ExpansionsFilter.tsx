import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { expansions } from '@/lib/CardsDB.ts'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  expansionFilter: string
  setExpansionFilter: (expansionFilter: string) => void
  setPackFilter: (expansionFilter: string) => void
}
const ExpansionsFilter: FC<Props> = ({ expansionFilter, setExpansionFilter, setPackFilter }) => {
  const { t } = useTranslation('common/sets')

  return (
    <Tabs
      value={expansionFilter}
      onValueChange={(value) => {
        setExpansionFilter(value)
        setPackFilter('all')
      }}
      className="w-full"
    >
      <TabsList className="w-full flex-wrap h-auto border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        {expansions.map((expansion) => (
          <TabsTrigger key={`tab_trigger_${expansion.id}`} value={expansion.id}>
            {t(expansion.name)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default ExpansionsFilter
