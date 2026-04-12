import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DropdownFilter, TabsFilter } from '@/components/Filters'
import { MissionsTable } from '@/components/MissionsTable'
import { Button } from '@/components/ui/button'
import { getExpansionById } from '@/lib/CardsDB'
import { useAccount } from '@/services/account/useAccount'
import { type ExpansionId, expansionIds, type Mission } from '@/types'
import MissionDetail from './MissionDetail'

const ownedOptions = ['all', 'owned', 'missing'] as const
type OwnedOption = (typeof ownedOptions)[number]

export default function Missions() {
  const { t } = useTranslation(['pages/collection', 'filters'])
  const { data: account } = useAccount()

  const [expansion, setExpansion] = useState<ExpansionId>('A1')
  const [ownedFilter, setOwnedFilter] = useState<OwnedOption>('all')
  const [missions, setMissions] = useState<Mission[] | null>(null)
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])
  const [resetScrollTrigger] = useState(false)

  const getLocalizedExpansion = (id: ExpansionId) => t(getExpansionById(id).name, { ns: 'common/sets' })

  useEffect(() => {
    let missions = getExpansionById(expansion).missions
    if (!missions) {
      throw new Error(`This expansion has no missions: ${expansion}`)
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
    setMissions(missions)
  }, [expansion, ownedFilter, account?.completed_missions])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex flex-wrap gap-2 mx-4">
        <DropdownFilter
          label={t('expansion', { ns: 'common/sets' })}
          options={expansionIds}
          value={expansion}
          onChange={setExpansion}
          show={getLocalizedExpansion}
        />
        <TabsFilter options={ownedOptions} value={ownedFilter} onChange={setOwnedFilter} show={(x) => t(x, { ns: 'filters', keyPrefix: 'f-owned' })} />
        <Link to="/collection">
          <Button className="ml-auto cursor-pointer" variant="outline">
            {t('goToCollection')}
          </Button>
        </Link>
      </div>
      {missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </div>
  )
}
