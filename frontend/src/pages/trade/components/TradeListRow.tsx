import { Slot } from '@radix-ui/react-slot'
import { ArrowLeft, ArrowRight, ArrowRightLeft, Check, ChevronsDown, ChevronsUp, X } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { CardLine } from '@/components/CardLine'
import { getInternalIdByCardId } from '@/lib/CardsDB'
import { useAccount } from '@/services/account/useAccount'
import { useTradingCards } from '@/services/collection/useCollection'
import type { TradeRow, TradeStatus } from '@/types'

interface Props {
  row: TradeRow
  selectedTradeId?: number
  setSelectedTradeId: (id: number | undefined) => void
}

const pendingStatuses: TradeStatus[] = ['offered', 'accepted']

export const TradeListRow: FC<Props> = ({ row, selectedTradeId, setSelectedTradeId }) => {
  const { t } = useTranslation('trade-matches')

  const { data: account, isLoading } = useAccount()
  const { data: trading } = useTradingCards()

  if (isLoading) {
    return null
  }

  if (!account) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  const yourCard = row.offering_friend_id === account.friend_id ? row.offer_card_id : row.receiver_card_id
  const friendCard = row.offering_friend_id === account.friend_id ? row.receiver_card_id : row.offer_card_id
  const ended = row.offering_friend_id === account.friend_id ? row.offerer_ended : row.receiver_ended

  function onClick(row: TradeRow) {
    if (selectedTradeId === row.id) {
      setSelectedTradeId(undefined)
    } else {
      setSelectedTradeId(row.id)
    }
  }

  const status = (row: TradeRow) => {
    const style = {
      offered: row.offering_friend_id === account.friend_id ? <ArrowRight className="bg-amber-600" /> : <ArrowLeft className="bg-amber-600" />,
      accepted: <ArrowRightLeft className="bg-lime-600" />,
      declined: <X className="bg-stone-600" />,
      finished: <Check className="bg-indigo-600" />,
    }
    return (
      <>
        <Tooltip id={`status-${row.id}`} />
        <Slot className="shrink-0 rounded-full p-[3px] my-auto" data-tooltip-id={`status-${row.id}`} data-tooltip-content={t(`status.${row.status}`)}>
          {style[row.status]}
        </Slot>
      </>
    )
  }

  return (
    <li
      className={`flex cursor-pointer rounded gap-1 md:gap-2 p-1 ${selectedTradeId === row.id && 'bg-green-800/75'} hover:bg-neutral-700`}
      onClick={() => onClick(row)}
    >
      {status(row)}
      <div className="flex flex-col-reverse md:flex-row grow-1 justify-between gap-1 md:gap-2">
        <div className="flex flex-1">
          <ChevronsUp />
          {yourCard ? (
            <CardLine className="flex-1 bg-neutral-900" card_id={yourCard} increment={ended ? undefined : -1}>
              {pendingStatuses.includes(row.status) && trading && !trading.extra.includes(getInternalIdByCardId(yourCard)) && (
                <>
                  <Tooltip id={`notextra-${yourCard}`} clickable={true} style={{ maxWidth: '300px', whiteSpace: 'normal' }} />
                  <span
                    className="text-xs mr-1 my-1 px-1.5 rounded border border-red-700/50 bg-red-800/40"
                    data-tooltip-id={`notextra-${yourCard}`}
                    data-tooltip-content="You no longer have extra copies of that card"
                  >
                    !
                  </span>
                </>
              )}
            </CardLine>
          ) : (
            <span className="flex-1 bg-neutral-900 rounded-sm text-center">Select card</span>
          )}
        </div>
        <div className="flex flex-1">
          <ChevronsDown />
          {friendCard ? (
            <CardLine className="flex-1 bg-neutral-900" card_id={friendCard} increment={ended ? undefined : 1}>
              {pendingStatuses.includes(row.status) && trading && !trading.wanted.includes(getInternalIdByCardId(friendCard)) && (
                <>
                  <Tooltip id={`notextra-${yourCard}`} clickable={true} style={{ maxWidth: '300px', whiteSpace: 'normal' }} />
                  <span
                    className="text-xs mr-1 my-1 px-1.5 rounded border border-red-700/50 bg-red-800/40"
                    data-tooltip-id={`notextra-${yourCard}`}
                    data-tooltip-content="You no longer need that card"
                  >
                    !
                  </span>
                </>
              )}
            </CardLine>
          ) : (
            <span className="flex-1 bg-neutral-900 rounded-sm text-center">Select card</span>
          )}
        </div>
      </div>
    </li>
  )
}
