import { useEffect, useState } from 'react'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter'
import OwnedFilter from '@/components/filters/OwnedFilter'
import { MissionsTable } from '@/components/MissionsTable'
import { Button } from '@/components/ui/button'
import { expansionsDict } from '@/lib/CardsDB'
import type { Mission } from '@/types'
import MissionDetail from './MissionDetail'

interface Props {
  onSwitchToCards: () => void
}

export function Missions({ onSwitchToCards }: Props) {
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
    <>
      <div className="flex flex-wrap gap-2 mx-4">
        <ExpansionsFilter value={expansion} onChange={setExpansion} allowAll={false} />
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <Button className="border ml-auto cursor-pointer" variant="ghost" onClick={onSwitchToCards}>
          Go to collection
        </Button>
      </div>
      {missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} setSelectedMissionCardOptions={setSelectedMissionCardOptions} />}
      <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />
    </>
  )
}
