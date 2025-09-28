import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { DropdownFilter, TabsFilter } from '@/components/Filters'
import { MissionsTable } from '@/components/MissionsTable'
import { Button } from '@/components/ui/button'
import { expansionsDict, getExpansionById } from '@/lib/CardsDB'
import { type ExpansionId, expansionIds, type Mission } from '@/types'
import MissionDetail from './MissionDetail'

const ownedOptions = ['all', 'owned', 'missing'] as const
type OwnedOption = (typeof ownedOptions)[number]

export default function Missions() {
  const { t } = useTranslation(['pages/collection', 'filters'])
  const navigate = useNavigate()

  const [expansion, setExpansion] = useState<ExpansionId>('A1')
  const [ownedFilter, setOwnedFilter] = useState<OwnedOption>('all')
  const [missions, setMissions] = useState<Mission[] | null>(null)
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])
  const [resetScrollTrigger] = useState(false)

  const getLocalizedExpansion = (id: ExpansionId) => t(getExpansionById(id)?.name ?? 'unknown', { ns: 'common/sets' })

  useEffect(() => {
    let missions = expansionsDict.get(expansion)?.missions
    if (!missions) {
      throw new Error(`Unrecognized expansion id: ${expansion}`)
    }
    if (ownedFilter === 'owned') {
      missions = missions.filter((mission) => mission.completed)
    } else if (ownedFilter === 'missing') {
      missions = missions.filter((mission) => !mission.completed)
    }
    setMissions(missions)
  }, [expansion, ownedFilter])

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
        <Button className="ml-auto cursor-pointer" variant="outline" onClick={() => navigate('/collection')}>
          {t('goToCollection')}
        </Button>
      </div>
      {missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </div>
  )
}
