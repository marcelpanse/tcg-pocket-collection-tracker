import i18n from 'i18next'
import { CircleHelp, Trophy } from 'lucide-react'
import { use, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import FancyCard from '@/components/FancyCard.tsx'
import { getCardById, pullRateForSpecificMission } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import { getCardNameByLang } from '@/lib/utils.ts'
import type { Mission as MissionType } from '@/types'

interface Props {
  mission: MissionType
  resetScrollTrigger?: boolean
}

export interface MissionDetailProps {
  cardId: string
  owned: boolean
  missionCardOptions: string[]
}

export function Mission({ mission }: Props) {
  const { width } = useWindowDimensions()
  const { t } = useTranslation('common/packs')

  const { ownedCards, setSelectedCardId, setSelectedMissionCardOptions } = use(CollectionContext)

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
    let isMissionCompleted = true
    const shownCards = mission.requiredCards.flatMap((missionCard) => {
      let ownedMissionCards = ownedCards.reduce((acc, ownedCard) => {
        const hasCard = missionCard.options.find((cardId) => cardId === ownedCard.card_id)
        if (hasCard) {
          for (let i = 0; i < ownedCard.amount_owned; i++) {
            acc.push({ cardId: hasCard, owned: true, missionCardOptions: missionCard.options })
          }
        }
        return acc
      }, [] as MissionDetailProps[])

      if (ownedMissionCards.length > missionCard.amount) {
        ownedMissionCards = ownedMissionCards.slice(0, missionCard.amount)
      }

      const amountToAppend = missionCard.amount - ownedMissionCards.length
      for (let i = 0; i < amountToAppend; i++) {
        ownedMissionCards.push({ cardId: missionCard.options[0], owned: false, missionCardOptions: missionCard.options })
      }
      isMissionCompleted = isMissionCompleted && amountToAppend === 0
      return ownedMissionCards
    })

    mission.completed = isMissionCompleted
    const gridRows = []
    for (let i = 0; i < shownCards.length; i += cardsPerRow) {
      gridRows.push(shownCards.slice(i, i + cardsPerRow))
    }
    return gridRows
  }, [cardsPerRow])

  const missionHeight = cardHeight * missionGridRows.length + 72
  return (
    <div style={{ height: `${missionHeight}px` }} className="relative w-full">
      <div style={{ height: `${missionHeight}px` }} className="relative w-full">
        {missionGridRows.map((gridRow, i) => {
          return (
            <div key={i} style={{ height: `${cardHeight}px`, transform: `translateY(${cardHeight * i + 72}px)` }} className="absolute top-0 left-0 w-full">
              <div className="flex justify-start gap-x-3">
                {gridRow.map((card) => {
                  const foundCard = getCardById(card.cardId)
                  return (
                    foundCard && (
                      <div className={'group flex w-fit max-w-32 md:max-w-40 flex-col items-center rounded-lg cursor-pointer'}>
                        <button
                          type="button"
                          onClick={() => (card.owned ? setSelectedCardId(card.cardId) : setSelectedMissionCardOptions(card.missionCardOptions))}
                        >
                          <FancyCard card={foundCard} selected={card.owned} />
                        </button>
                        <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
                          {card.cardId} - {getCardNameByLang(foundCard, i18n.language)}
                        </p>
                      </div>
                    )
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* note header is absolute and has to be below table for the tooltip to work */}
      <div key={'header'} style={{ height: '72px' }} className="absolute top-0 left-0 w-full">
        <h2 className="flex items-center gap-x-4 mx-auto mt-10 w-full max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 font-semibold text-md sm:text-lg md:text-2xl tracking-tight transition-colors first:mt-0">
          {mission.name}

          <Tooltip id={`rewardDescription${mission.name}`} style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: 16 }} clickable={true} />
          <Trophy className="h-6 w-6" data-tooltip-id={`rewardDescription${mission.name}`} data-tooltip-html={mission.reward} />
          <Tooltip id={`probability${mission.name}`} style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: 16 }} clickable={true} />
          <CircleHelp
            className="h-6 w-6"
            data-tooltip-id={`probability${mission.name}`}
            data-tooltip-html={
              mission.completed
                ? 'Completed!'
                : pullRateForSpecificMission(mission, missionGridRows)
                    .filter(([packName, probability]) => packName !== 'everypack' && probability > 0)
                    .map(([packName, probability]) => `${t(packName)}: ${probability.toFixed(2)}%`)
                    .join('<br/>')
            }
          />
        </h2>
      </div>
    </div>
  )
}
