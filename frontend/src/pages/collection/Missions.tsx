import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownFilter, TabsFilter } from '@/components/Filters'
import { MissionsTable } from '@/components/MissionsTable'
import { expansions, getExpansionById } from '@/lib/CardsDB'
import { getMissionType, type MissionType } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'
import type { ExpansionId, Mission } from '@/types'
import MissionDetail from './MissionDetail'

const ownedOptions = ['all', 'owned', 'missing'] as const
type OwnedOption = (typeof ownedOptions)[number]

const typeOptions: MissionType[] = ['all', 'normal', 'secret', 'complete']

const expansionsWithMissions = expansions.filter((e) => e.missions && e.missions.length > 0).map((e) => e.id as ExpansionId)

export default function Missions() {
  const { t } = useTranslation(['pages/collection', 'filters'])
  const { data: account } = useAccount()

  const [expansion, setExpansion] = useState<ExpansionId>(expansionsWithMissions[0])
  const [ownedFilter, setOwnedFilter] = useState<OwnedOption>('all')
  const [typeFilter, setTypeFilter] = useState<MissionType>('all')
  const [missions, setMissions] = useState<Mission[] | null>(null)
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])
  const [resetScrollTrigger] = useState(false)

  const getLocalizedExpansion = (id: ExpansionId) => t(getExpansionById(id).name, { ns: 'common/sets' })

  useEffect(() => {
    let missions = getExpansionById(expansion).missions
    if (!missions) {
      return
    }
    if (ownedFilter === 'owned') {
      missions = missions.filter((mission) => {
        const missionKey = `${mission.expansionId}_${mission.name}`
        const isManuallyCompleted = account?.completed_missions?.includes(missionKey) || false
        return mission.completed || isManuallyCompleted
      })
    } else if (ownedFilter === 'missing') {
      missions = missions.filter((mission) => {
        const missionKey = `${mission.expansionId}_${mission.name}`
        const isManuallyCompleted = account?.completed_missions?.includes(missionKey) || false
        return !mission.completed && !isManuallyCompleted
      })
    }
    if (typeFilter !== 'all') {
      missions = missions.filter((mission) => getMissionType(mission) === typeFilter)
    }
    setMissions(missions)
  }, [expansion, ownedFilter, typeFilter, account?.completed_missions])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex flex-wrap gap-2 mx-4">
        <DropdownFilter
          label={t('expansion', { ns: 'common/sets' })}
          options={expansionsWithMissions}
          value={expansion}
          onChange={setExpansion}
          show={getLocalizedExpansion}
        />
        <TabsFilter options={ownedOptions} value={ownedFilter} onChange={setOwnedFilter} show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })} />
        <TabsFilter options={typeOptions} value={typeFilter} onChange={setTypeFilter} show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-missiontype' })} />
      </div>
      {missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </div>
  )
}
