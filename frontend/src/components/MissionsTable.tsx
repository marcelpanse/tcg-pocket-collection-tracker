import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Mission as MissionType } from '@/types'
import { Mission } from './Mission.tsx'

interface Props {
  missions: MissionType[]
  resetScrollTrigger?: boolean
}

export function MissionsTable({ missions, resetScrollTrigger }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollContainerHeight, setScrollContainerHeight] = useState('auto')

  useLayoutEffect(() => {
    const updateScrollContainerHeight = () => {
      if (scrollRef.current) {
        const headerHeight = (document.querySelector('#header') as HTMLElement | null)?.offsetHeight || 0
        const filterbarHeight = (document.querySelector('#filterbar') as HTMLElement | null)?.offsetHeight || 0
        const maxHeight = window.innerHeight - headerHeight - filterbarHeight

        setScrollContainerHeight(`${maxHeight}px`)
      }
    }

    updateScrollContainerHeight()
    window.addEventListener('resize', updateScrollContainerHeight)

    return () => {
      window.removeEventListener('resize', updateScrollContainerHeight)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [resetScrollTrigger])

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto mt-2 sm:mt-4 px-4 flex flex-col justify-start"
      style={{ scrollbarWidth: 'none', height: scrollContainerHeight }}
    >
      {missions.map((mission) => (
        <Mission key={mission.name} mission={mission} />
      ))}
    </div>
  )
}
