import { type ReactNode, useState } from 'react'
import { TradeListRow } from '@/pages/trade/components/TradeListRow.tsx'
import type { TradeRow } from '@/types'
import Actions from './Actions'

interface Props {
  children?: ReactNode
  trades: TradeRow[]
}

function TradeList({ children, trades }: Props) {
  const [selectedTradeId, setSelectedTradeId] = useState<number | undefined>(undefined)
  const selectedTrade = trades.find((r) => r.id === selectedTradeId)

  if (trades.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-1 md:p-2">
      <ul className="flex flex-col gap-2 md:gap-0">
        {trades
          .toSorted((a, b) => (a.created_at > b.created_at ? -1 : 1))
          .map((x) => (
            <TradeListRow key={x.id} row={x} selectedTradeId={selectedTradeId} setSelectedTradeId={setSelectedTradeId} />
          ))}
      </ul>
      {children}
      {selectedTrade && (
        <div className="flex gap-2 text-center items-center mt-2">
          <Actions trade={selectedTrade} setSelected={setSelectedTradeId} />
        </div>
      )}
    </div>
  )
}

export default TradeList
