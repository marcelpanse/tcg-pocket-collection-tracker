import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import type { Mission as MissionType } from '@/types'
import { useMemo } from 'react'
import { Card } from './Card.tsx'

interface Props {
  mission: MissionType
  resetScrollTrigger?: boolean
}

export function Mission({ mission }: Props) {
  const { width } = useWindowDimensions()

  let cardsPerRow = 5
  let cardHeight = Math.min(width, 890) / 5 + 120
  if (width > 600 && width < 800) {
    cardsPerRow = 4
    cardHeight = width / 3 + 50
  } else if (width <= 600) {
    cardsPerRow = 3
    cardHeight = width / 3 + 100
  }

  const missionGridRows = useMemo(() => {
    const gridRows = []
    for (let i = 0; i < mission.requiredCards.length; i += cardsPerRow) {
      gridRows.push(mission.requiredCards.slice(i, i + cardsPerRow))
    }
    return gridRows
  }, [cardsPerRow])

  const missionHeight = cardHeight * missionGridRows.length + 72
  return (
    <div style={{ height: `${missionHeight}px` }} className="relative w-full">
      <div key={'header'} style={{ height: '72px' }} className="absolute top-0 left-0 w-full">
        <h2 className="mx-auto mt-10 text-center w-full max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 font-semibold text-md sm:text-lg md:text-2xl tracking-tight transition-colors first:mt-0">
          {mission.name}
        </h2>
      </div>
      <div style={{ height: `${missionHeight}px` }} className="relative w-full">
        {missionGridRows.map((gridRow, i) => {
          return (
            <div key={i} style={{ height: `${cardHeight}px`, transform: `translateY(${cardHeight * i + 72}px)` }} className="absolute top-0 left-0 w-full">
              <div className="flex justify-center gap-x-3">
                {gridRow.map((card) => {
                  if (card.cards) {
                    return <Card key={card.cards[0].card_id} card={card.cards[0]} />
                  }
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
