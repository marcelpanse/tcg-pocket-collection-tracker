import i18n from 'i18next'
import { Check, CircleCheck, CircleHelp, X } from 'lucide-react'
import { type FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import FancyCard from '@/components/FancyCard.tsx'
import useWindowDimensions from '@/hooks/useWindowDimensionsHook.ts'
import { getCardById, getCardByInternalId } from '@/lib/CardsDB.ts'
import { pullRateForSpecificMission } from '@/lib/stats'
import { getCardNameByLang } from '@/lib/utils.ts'
import { useAccount, useUpdateAccount } from '@/services/account/useAccount'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import type { CollectionRow, Mission as MissionType } from '@/types'

type RewardItem = { label: string; qty: string; type: string }

function parseRewards(rewardStr?: string): RewardItem[] {
  if (!rewardStr) {
    return []
  }
  return rewardStr.split('<br />').map((item) => {
    const trimmed = item.trim()
    const qtyMatch = trimmed.match(/\s×(\d+)$/)
    const qty = qtyMatch ? `×${qtyMatch[1]}` : ''
    const label = qty ? trimmed.slice(0, trimmed.lastIndexOf(' ×')).trim() : trimmed

    let type = 'special'
    if (label === 'Wonder Hourglass') {
      type = 'wonder-hourglass'
    } else if (label === 'Pack Hourglass') {
      type = 'pack-hourglass'
    } else if (label === 'Shop Ticket') {
      type = 'shop-ticket'
    } else if (label === 'Shinedust') {
      type = 'shinedust'
    } else if (label.startsWith('Emblem Ticket')) {
      type = 'emblem-ticket'
    } else if (label.endsWith('(emblem)')) {
      type = 'emblem'
    } else if (label.endsWith('(profile icon)')) {
      type = 'profile-icon'
    } else if (label.endsWith('(icon)')) {
      type = 'icon'
    } else if (label.endsWith('(cover)')) {
      type = 'cover'
    } else if (label.endsWith('(backdrop)')) {
      type = 'backdrop'
    }

    return { label, qty, type }
  })
}

const rewardConfig: Record<string, { emoji: string; bg: string; short: (label: string) => string }> = {
  'wonder-hourglass': { emoji: '⏳', bg: 'bg-yellow-600', short: () => 'Wonder Hourglass' },
  'pack-hourglass': { emoji: '⏳', bg: 'bg-orange-600', short: () => 'Pack Hourglass' },
  'shop-ticket': { emoji: '🎫', bg: 'bg-blue-600', short: () => 'Shop Ticket' },
  shinedust: { emoji: '✨', bg: 'bg-rose-500', short: () => 'Shinedust' },
  'emblem-ticket': { emoji: '🎟️', bg: 'bg-purple-700', short: () => 'Emblem Ticket' },
  emblem: { emoji: '🏅', bg: 'bg-amber-600', short: (label) => label.replace(' (emblem)', '') },
  'profile-icon': { emoji: '👤', bg: 'bg-teal-600', short: (label) => label.replace(' (profile icon)', '') },
  icon: { emoji: '🖼️', bg: 'bg-cyan-700', short: (label) => label.replace(' (icon)', '') },
  cover: { emoji: '🗺️', bg: 'bg-green-700', short: (label) => label.replace(' (cover)', '') },
  backdrop: { emoji: '🎨', bg: 'bg-indigo-600', short: (label) => label.replace(' (backdrop)', '') },
  special: { emoji: '⭐', bg: 'bg-pink-700', short: (label) => label },
}

interface Props {
  mission: MissionType
  setSelectedMissionCardOptions: (options: string[]) => void
}

export interface MissionDetailProps {
  id: number
  owned: boolean
  missionCardOptions: string[]
}

export const Mission: FC<Props> = ({ mission, setSelectedMissionCardOptions }) => {
  const { width } = useWindowDimensions()
  const { t } = useTranslation('common/packs')
  const { t: tCollection } = useTranslation('pages/collection')

  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()
  const { setSelectedCardId } = useSelectedCard()
  const { data: account } = useAccount()
  const { mutate: updateAccount } = useUpdateAccount()

  const missionKey = `${mission.expansionId}_${mission.name}`
  const isManuallyCompleted = account?.completed_missions?.includes(missionKey) || false
  const headerRef = useRef<HTMLDivElement>(null)

  // Dynamic sizing: scales from Mobile S (320px) to 4K (2560px)
  const CARD_ASPECT_RATIO = 88 / 63 // standard TCG card portrait ratio (~1.397)
  const CARD_NAME_HEIGHT = 28 // 12px text + pt-2 + breathing room
  const ROW_BUFFER = 16 // gap between card rows

  const MAX_CONTAINER_WIDTH = 900
  const effectiveWidth = Math.min(width, MAX_CONTAINER_WIDTH)

  let cardsPerRow: number
  if (width >= 1024) {
    cardsPerRow = 5
  } else if (width >= 640) {
    cardsPerRow = 4
  } else if (width >= 400) {
    cardsPerRow = 3
  } else {
    cardsPerRow = 2
  }

  const GAP_X = 12 // tailwind gap-x-3
  const MAX_CARD_WIDTH = width >= 768 ? 160 : 128 // matches max-w-32 / md:max-w-40
  const cardWidth = Math.min((effectiveWidth - GAP_X * (cardsPerRow - 1)) / cardsPerRow, MAX_CARD_WIDTH)
  const cardHeight = cardWidth * CARD_ASPECT_RATIO + CARD_NAME_HEIGHT + ROW_BUFFER

  const missionGridRows = () => {
    let isMissionCompleted = true
    const shownCards = mission.requiredCards.flatMap((missionCard) => {
      const ownedMissionCards: MissionDetailProps[] = []

      // Only check the specific cards in missionCard.options
      for (const cardId of missionCard.options) {
        const internalId = getCardById(cardId)?.internal_id || 0
        const ownedCard = ownedCards.get(internalId)
        if (ownedCard?.collection.includes(cardId)) {
          for (let i = 0; i < ownedCard.amount_owned; i++) {
            ownedMissionCards.push({ id: internalId, owned: true, missionCardOptions: missionCard.options })

            // Early exit once we have enough cards
            if (ownedMissionCards.length >= missionCard.amount) {
              break
            }
          }
        }

        // Early exit once we have enough cards
        if (ownedMissionCards.length >= missionCard.amount) {
          break
        }
      }

      const amountToAppend = missionCard.amount - ownedMissionCards.length
      for (let i = 0; i < amountToAppend; i++) {
        ownedMissionCards.push({ id: getCardById(missionCard.options[0])?.internal_id as number, owned: false, missionCardOptions: missionCard.options })
      }
      isMissionCompleted = isMissionCompleted && amountToAppend === 0
      return ownedMissionCards
    })

    mission.completed = isMissionCompleted || isManuallyCompleted
    const gridRows = []
    for (let i = 0; i < shownCards.length; i += cardsPerRow) {
      gridRows.push(shownCards.slice(i, i + cardsPerRow))
    }
    return gridRows
  }

  const handleManualComplete = () => {
    if (!account) {
      return
    }

    const currentCompletedMissions = account.completed_missions || []
    const updatedMissions = isManuallyCompleted ? currentCompletedMissions.filter((m) => m !== missionKey) : [...currentCompletedMissions, missionKey]

    const mergedAccount = {
      ...account,
      completed_missions: updatedMissions,
    }
    delete mergedAccount.trade_rarity_settings
    updateAccount(mergedAccount)
  }

  const missionHeight = cardHeight * missionGridRows().length + (headerRef.current?.offsetHeight ?? 72)
  const missionGap = Math.max((headerRef.current?.offsetHeight ?? 72) * 0.2, 12)
  return (
    <div className="relative w-full" style={{ marginBottom: `${missionGap}px` }}>
      <div style={{ height: `${missionHeight}px` }} className="relative w-full">
        {missionGridRows().map((gridRow, i) => (
          <div
            key={i}
            style={{ height: `${cardHeight}px`, transform: `translateY(${cardHeight * i + (headerRef.current?.offsetHeight ?? 72)}px)` }}
            className="absolute top-0 left-0 w-full"
          >
            <div className="flex justify-start gap-x-3">
              {gridRow.map((card, j) => {
                const foundCard = getCardByInternalId(card.id)
                return (
                  foundCard && (
                    <div key={`${mission.name}__${j}`} className={'group flex w-fit max-w-32 md:max-w-40 flex-col items-center rounded-lg cursor-pointer'}>
                      <div className="relative">
                        <button
                          type="button"
                          title={getCardNameByLang(foundCard, i18n.language)}
                          onClick={() => (card.owned ? setSelectedCardId(card.id) : setSelectedMissionCardOptions(card.missionCardOptions))}
                        >
                          <FancyCard card={foundCard} selected={card.owned} />
                        </button>
                        <div
                          className={`absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center shadow-md pointer-events-none ${card.owned ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          {card.owned ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
                        {getCardNameByLang(foundCard, i18n.language)}
                      </p>
                    </div>
                  )
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* note header is absolute and has to be below table for the tooltip to work */}
      <div ref={headerRef} key={'header'} className="absolute top-0 left-0 w-full">
        <h2 className="flex items-start gap-x-2 mx-auto w-full max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 mb-4 font-semibold text-md sm:text-lg md:text-2xl tracking-tight transition-colors">
          <div className="flex flex-col gap-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {mission.name}
              {(() => {
                const allCards = missionGridRows().flat()
                const owned = allCards.filter((c) => c.owned).length
                const total = allCards.length
                return (
                  <span
                    className={`text-sm font-normal px-2 py-0.5 rounded-full ${owned === total ? 'bg-green-700 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                  >
                    {owned}/{total}
                  </span>
                )
              })()}
            </div>
            <div className="flex flex-wrap gap-1">
              {parseRewards(mission.reward).map((item, idx) => {
                const cfg = rewardConfig[item.type]
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 text-xs font-normal text-white px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg}`}
                  >
                    {cfg.emoji} {cfg.short(item.label)}
                    {item.qty && <span className="font-semibold">{item.qty}</span>}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0 ml-auto pt-0.5">
            <Tooltip id={`probability${mission.name}`} style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: 16 }} clickable={true} />
            <CircleHelp
              className="h-6 w-6"
              data-tooltip-id={`probability${mission.name}`}
              data-tooltip-html={
                mission.completed
                  ? 'Completed!'
                  : pullRateForSpecificMission(mission, missionGridRows())
                      .filter(([packName, probability]) => packName !== 'everypack' && probability > 0)
                      .map(([packName, probability]) => `${t(packName)}: ${probability.toFixed(2)}%`)
                      .join('<br/>')
              }
            />
            <Tooltip id={`manualComplete${mission.name}`} style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: 16 }} clickable={true} />
            <CircleCheck
              className={`h-6 w-6 cursor-pointer ${isManuallyCompleted ? 'text-green-500' : 'text-white'}`}
              data-tooltip-id={`manualComplete${mission.name}`}
              data-tooltip-html={isManuallyCompleted ? tCollection('missionDetail.manuallyMarkedComplete') : tCollection('missionDetail.manuallyMarkComplete')}
              onClick={handleManualComplete}
            />
          </div>
        </h2>
      </div>
    </div>
  )
}
