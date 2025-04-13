import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  ownedFilter: string
  setOwnedFilter: (ownedFilter: 'all' | 'owned' | 'missing') => void
  fullWidth?: boolean
}
const OwnedFilter: FC<Props> = ({ ownedFilter, setOwnedFilter, fullWidth }) => {
  const { t } = useTranslation('owned-filter')

  return (
    <Tabs value={ownedFilter} onValueChange={(value) => setOwnedFilter(value as 'all' | 'owned' | 'missing')} className={fullWidth ? 'w-full' : 'w-70'}>
      <TabsList className="w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        <TabsTrigger value="missing">{t('missing')}</TabsTrigger>
        <TabsTrigger value="owned">{t('owned')}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OwnedFilter
