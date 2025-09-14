import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { useAccount } from '@/services/account/useAccount'
import type { TradeRow } from '@/types'
import { CardLine } from './CardLine'

interface Props {
  row: TradeRow
  selectedTradeId?: number
  setSelectedTradeId: (id: number | undefined) => void
}

export const TradeListRow: FC<Props> = ({ row, selectedTradeId, setSelectedTradeId }) => {
  const { t } = useTranslation('trade-matches')

  const { data: account } = useAccount()

  if (!account) {
    return null
  }

  const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
  const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id

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
      <div className="flex items-center">
        <Tooltip id={`tooltip-${row.id}`} />
        <span
          className={`rounded-full text-center w-7 md:w-9 ${style[row.status].color}`}
          data-tooltip-id={`tooltip-${row.id}`}
          data-tooltip-content={t(`status.${row.status}`)}
        >
          {style[row.status].icon}
        </span>
      </div>
    )
  }

  return (
    <li
      className={`flex cursor-pointer rounded gap-1 md:gap-4 p-1 ${selectedTradeId === row.id && 'bg-green-900'} hover:bg-neutral-500`}
      onClick={() => onClick(row)}
    >
      {status(row)}
      <div className="flex flex-col sm:flex-row w-full justify-between gap-1 md:gap-4">
        <CardLine className="sm:w-1/2" card_id={yourCard} increment={-1} />
        <CardLine className="sm:w-1/2" card_id={friendCard} increment={1} />
      </div>
    </li>
  )
}
