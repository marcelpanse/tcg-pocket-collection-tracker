import { type FC, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { getCardById } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { getCardNameByLang } from '@/lib/utils'
import type { TradeRow } from '@/types'

interface Props {
  row: TradeRow
  selectedTradeId?: number
  setSelectedTradeId: (id: number | undefined) => void
}

export const TradeListRow: FC<Props> = ({ row, selectedTradeId, setSelectedTradeId }) => {
  const { t, i18n } = useTranslation('trade-matches')
  const { account } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)

  if (!account) {
    return null
  }

  const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
  const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id

  function card(card_id: string) {
    const card = getCardById(card_id)
    if (!card) {
      return <span className="w-1/2 text-center">?</span>
    }
    return (
      <span className="flex rounded px-1 w-1/2 bg-zinc-800">
        <span className="mr-2 sm:min-w-10">{card.rarity} </span>
        <span className="mr-2 sm:min-w-14 me-4">{card.card_id} </span>
        <span>{getCardNameByLang(card, i18n.language)}</span>
        <span className="text-neutral-400 ml-auto">×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}</span>
      </span>
    )
  }

  function onClick(row: TradeRow) {
    if (selectedTradeId === row.id) {
      setSelectedTradeId(undefined)
    } else {
      setSelectedTradeId(row.id)
    }
  }

  const status = (row: TradeRow) => {
    const style = {
      offered: { icon: row.offering_friend_id === account.friend_id ? '→' : '←', color: 'bg-amber-600' },
      accepted: { icon: '↔', color: 'bg-lime-600' },
      declined: { icon: 'X', color: 'bg-stone-600' },
      finished: { icon: '✓', color: 'bg-indigo-600' },
    }
    return (
      <>
        <Tooltip id={`tooltip-${row.id}`} />
        <span
          className={`rounded-full text-center w-9 min-w-6 ${style[row.status].color}`}
          data-tooltip-id={`tooltip-${row.id}`}
          data-tooltip-content={t(`status.${row.status}`)}
        >
          {style[row.status].icon}
        </span>
      </>
    )
  }

  return (
    <li
      className={`flex cursor-pointer justify-between rounded gap-1 sm:gap-4 sm:px-1 py-1 my-1 ${selectedTradeId === row.id && 'bg-green-900'} hover:bg-neutral-500`}
      onClick={() => onClick(row)}
    >
      {status(row)}
      {card(yourCard)}
      {card(friendCard)}
    </li>
  )
}
