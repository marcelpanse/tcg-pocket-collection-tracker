import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { getExpansionById } from '@/lib/CardsDB.ts'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  packFilter: string
  setPackFilter: (packFilter: string) => void
  expansion: string
}
const PackFilter: FC<Props> = ({ packFilter, setPackFilter, expansion }) => {
  const { t } = useTranslation('common/packs')

  let packsToShow = getExpansionById(expansion)?.packs
  if (packsToShow === undefined || packsToShow.length < 1) {
    packsToShow = []
  }

  return (
    <Tabs value={packFilter} onValueChange={(value) => setPackFilter(value)} className="w-full">
      <TabsList className="w-full flex-wrap h-auto border-1 border-neutral-700 rounded-md">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        {packsToShow.map((pack) => (
          <TabsTrigger key={`tab_trigger_${pack.name}`} value={pack.name}>
            {t(pack.name)}
          </TabsTrigger>
        ))}
        <TabsTrigger value="missions">{t('missions')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default PackFilter
