// import FancyCard from '@/components/FancyCard.tsx'
// import { CollectionContext } from '@/lib/context/CollectionContext.ts'
// import { UserContext } from '@/lib/context/UserContext.ts'
// import { getCardNameByLang } from '@/lib/utils'
// import type { MissionCard as MissionCardType } from '@/types'
// import i18n from 'i18next'
// import { use, useState } from 'react'
// import { useParams } from 'react-router'
//
// interface Props {
//   missionCard: MissionCardType
//   useMaxWidth?: boolean
// }
//
// // keep track of the debounce timeouts for each card
// const _inputDebounce: Record<string, number | null> = {}
//
// export function MissionCard({ missionCard, useMaxWidth = false }: Props) {
//   const params = useParams()
//
//   const { user, setIsLoginDialogOpen } = use(UserContext)
//   const { ownedCards, setOwnedCards, setSelectedCardId } = use(CollectionContext)
//   const [completed, setCompleted] = useState(0)
//   const [inputValue, setInputValue] = useState(0)
//
//   return (
//     <div className={`group flex w-fit ${!useMaxWidth ? 'max-w-32 md:max-w-40' : ''} flex-col items-center rounded-lg cursor-pointer`}>
//       <div onClick={() => setSelectedCardId(missionCard.options[0].toString())}>
//         <FancyCard card={card} selected={amountOwned > 0} />
//       </div>
//       <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
//         {card.card_id} - {getCardNameByLang(card, i18n.language)}
//       </p>
//     </div>
//   )
// }
