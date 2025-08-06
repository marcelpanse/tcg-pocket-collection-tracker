import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { getExpansionById } from '@/lib/CardsDB.ts'

interface Props {
  value: string
  onChange: (v: string) => void
  expansion: string
  fullWidth?: boolean
}
const PackFilter: FC<Props> = ({ value, onChange, expansion, fullWidth }) => {
  const { t } = useTranslation('common/packs')

  let packsToShow = getExpansionById(expansion)?.packs
  const showMissions = !(packsToShow === undefined || expansion === 'P-A')
  if (packsToShow === undefined || packsToShow.length <= 1) {
    packsToShow = []
  }

  if (expansion === 'all' || expansion === 'P-A') {
    return null
  }

  return (
    <Tabs value={value} onValueChange={onChange} className={`h-auto ${fullWidth ? 'w-full' : 'w-[440px]'}`}>
      <TabsList className="h-full flex-wrap w-full border-1 border-neutral-700 rounded-md flex-row justify-start content-start">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        {packsToShow
          .filter((pack) => pack.name !== 'everypack')
          .map((pack) => (
            <TabsTrigger key={`tab_trigger_${pack.name}`} value={pack.name}>
              {t(pack.name)}
            </TabsTrigger>
          ))}
        {showMissions && <TabsTrigger value="missions">{t('missions')}</TabsTrigger>}
      </TabsList>
    </Tabs>
  )
}

export default PackFilter
