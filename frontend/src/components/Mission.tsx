import FancyCard from '@/components/FancyCard.tsx'
import { getCardById } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'
import { getCardNameByLang } from '@/lib/utils.ts'
import type { Mission as MissionType } from '@/types'
import i18n from 'i18next'
import { use, useMemo } from 'react'

interface Props {
  mission: MissionType
  resetScrollTrigger?: boolean
}

export function Mission({ mission }: Props) {
  const { width } = useWindowDimensions()

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

  interface MissionDetailProps {
    cardId: string
    owned: boolean
    missionCardOptions: string[]
  }

  const missionGridRows = useMemo(() => {
    const shownCards = mission.requiredCards.flatMap((missionCard) => {
      const ownedMissionCards = ownedCards.reduce((acc, ownedCard) => {
        const hasCard = missionCard.options.find((cardId) => cardId === ownedCard.card_id)
        if (hasCard) {
          for (let i = 0; i < ownedCard.amount_owned; i++) {
            acc.push({ cardId: hasCard, owned: true, missionCardOptions: missionCard.options })
          }
        }
        return acc
      }, [] as MissionDetailProps[])

      const amountToAppend = missionCard.amount - ownedMissionCards.length
      for (let i = 0; i < amountToAppend; i++) {
        ownedMissionCards.push({ cardId: missionCard.options[0], owned: false, missionCardOptions: missionCard.options })
      }
      mission.completed = amountToAppend === 0
      return ownedMissionCards
    })

    const gridRows = []
    for (let i = 0; i < shownCards.length; i += cardsPerRow) {
      gridRows.push(shownCards.slice(i, i + cardsPerRow))
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
                  const foundCard = getCardById(card.cardId)
                  return (
                    foundCard && (
                      <div className={'group flex w-fit max-w-32 md:max-w-40 flex-col items-center rounded-lg cursor-pointer'}>
                        <div onClick={() => (card.owned ? setSelectedCardId(card.cardId) : setSelectedMissionCardOptions(card.missionCardOptions))}>
                          <FancyCard card={foundCard} selected={card.owned} />
                        </div>
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
    </div>
  )
}
