import type { Mission as MissionType } from '@/types'
import { useEffect, useRef } from 'react'
import { Mission } from './Mission.tsx'

interface Props {
  missions: MissionType[]
  resetScrollTrigger?: boolean
}

export function MissionsTable({ missions, resetScrollTrigger }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resetScrollTrigger) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [resetScrollTrigger])

  return (
    <div ref={scrollRef} className="mt-2 sm:mt-4 px-4 flex flex-col justify-start min-h-screen">
      {missions.map((mission) => (
        <Mission key={mission.name} mission={mission} />
      ))}
    </div>
  )
}
