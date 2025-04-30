import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { expansions } from '@/lib/CardsDB.ts'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  packFilter: string
  setPackFilter: (packFilter: string) => void
  expansion: string
}
const PackFilter: FC<Props> = ({ packFilter, setPackFilter, expansion }) => {
  const { t } = useTranslation('common/packs')

  return (
    <Tabs value={packFilter} onValueChange={(value) => setPackFilter(value)} className="w-full">
      <TabsList className="w-full flex-wrap h-auto border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        {expansions
          .filter((exp) => exp.id === expansion)
          .map((exp) => {
            if (exp.packs.length > 1) {
              return exp.packs
                .filter((pack) => pack.name !== 'everypack')
                .map((pack) => (
                  <TabsTrigger key={`tab_trigger_${pack.name}`} value={pack.name}>
                    {t(pack.name)}
                  </TabsTrigger>
                ))
            }
          })}
      </TabsList>
    </Tabs>
  )
}

export default PackFilter
