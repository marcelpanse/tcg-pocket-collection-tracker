import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter'
import OwnedFilter from '@/components/filters/OwnedFilter'
import { MissionsTable } from '@/components/MissionsTable'
import { Button } from '@/components/ui/button'
import { expansionsDict } from '@/lib/CardsDB'
import type { Mission } from '@/types'
import MissionDetail from './MissionDetail'

export default function Missions() {
  const { t } = useTranslation(['pages/collection'])
  const navigate = useNavigate()

  const [expansion, setExpansion] = useState<string>('A1')
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [missions, setMissions] = useState<Mission[] | null>(null)
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])
  const [resetScrollTrigger] = useState(false)

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
        <ExpansionsFilter value={expansion} onChange={setExpansion} allowAll={false} />
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <Button className="ml-auto cursor-pointer" variant="outline" onClick={() => navigate('/collection')}>
          {t('goToCollection')}
        </Button>
      </div>
      {missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </div>
  )
}
