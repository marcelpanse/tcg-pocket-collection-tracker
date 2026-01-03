import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownFilter, TabsFilter } from '@/components/Filters'
import { MissionsTable } from '@/components/MissionsTable'
import { getExpansionById } from '@/lib/CardsDB'
import { type ExpansionId, expansionIds, type Mission } from '@/types'
import MissionDetail from './MissionDetail'

const completedOptions = ['all', 'completed', 'missing'] as const
type CompletedOption = (typeof completedOptions)[number]

const expansionOptions = expansionIds.filter((id) => !getExpansionById(id).promo)

function filterMissions(missions: Mission[], option: CompletedOption) {
  if (option === 'completed') {
    return missions.filter((m) => m.completed)
  } else if (option === 'missing') {
    return missions.filter((m) => !m.completed)
  } else {
    return missions
  }
}

export default function Missions() {
  const { t } = useTranslation(['pages/collection', 'filters'])

  const [expansion, setExpansion] = useState<ExpansionId>(expansionOptions[0])
  const [ownedFilter, setOwnedFilter] = useState<CompletedOption>('all')
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])
  const [resetScrollTrigger] = useState(false)

  const missions = useQuery({
    queryKey: ['pages', 'missions', expansion],
    queryFn: () => import(`../../../assets/themed-collections/${expansion}-missions.json`),
  })

  if (missions.isLoading) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }

  if (missions.isError || !missions.data) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  const filteredMissions = filterMissions(missions.data.default as Mission[], ownedFilter)

  const getLocalizedExpansion = (id: ExpansionId) => t(getExpansionById(id).name, { ns: 'common/sets' })

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex flex-wrap gap-2 mx-4">
        <DropdownFilter
          label={t('expansion', { ns: 'common/sets' })}
          options={expansionOptions}
          value={expansion}
          onChange={setExpansion}
          show={getLocalizedExpansion}
        />
        <TabsFilter options={completedOptions} value={ownedFilter} onChange={setOwnedFilter} show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-missions' })} />
      </div>
      {missions && (
        <MissionsTable missions={filteredMissions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />
      )}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </div>
  )
}
