import { useVirtualizer } from '@tanstack/react-virtual'
import { createContext, useEffect, useState } from 'react'
import { searchPredicate } from '@/lib/filters'
import type { Card } from '@/types'
import { CardLine } from './CardLine'
import SearchInput from './filters/SearchInput'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

export interface SelectCardRequest {
  cards: Card[]
  callback: (internal_id: number) => void | Promise<void>
}

export interface ISelectCardContext {
  selectCard: (request: SelectCardRequest) => void
}

export const SelectCardContext = createContext<ISelectCardContext>({
  selectCard: () => {
    throw new Error("Can't open SelectCardDialog: not in SelectCardContext")
  },
})

export interface Props {
  request: SelectCardRequest | undefined
  onClose: () => void
}

export function SelectCardDialog({ request, onClose }: Props) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Card | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!request) {
      setSearch('')
      setSelected(undefined)
      setSubmitting(false)
    }
  }, [request])

  const onSubmit = async () => {
    if (!request || !selected || submitting) {
      return
    }
    setSubmitting(true)
    try {
      await request.callback(selected.internal_id)
      setSearch('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCards = request?.cards.filter(searchPredicate(search))

  const virtualizer = useVirtualizer({
    getScrollElement: () => scrollElement,
    count: filteredCards?.length ?? 0,
    getItemKey: (index) => filteredCards?.[index].card_id ?? '',
    estimateSize: () => 32,
  })

  return (
    <Dialog open={!!request} onOpenChange={(open) => open || onClose()}>
      <DialogContent>
        <DialogTitle>Select a card</DialogTitle>
        <SearchInput setValue={setSearch} />
        <div ref={setScrollElement} className="h-72 rounded-md border border-neutral-700 px-1 overflow-y-auto">
          <ul style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
            {virtualizer.getVirtualItems().map((row) => {
              const c = filteredCards?.[row.index] as Card
              return (
                <button
                  type="button"
                  key={row.key}
                  className="absolute top-0 left-0 w-full cursor-pointer"
                  style={{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }}
                  onClick={() => setSelected(c)}
                >
                  <CardLine className={`w-full ${selected?.card_id === c.card_id && 'bg-green-900'} hover:bg-neutral-600`} card_id={c.card_id} />
                </button>
              )
            })}
          </ul>
        </div>
        <Button disabled={!selected || submitting} isPending={submitting} onClick={onSubmit}>
          {selected ? `Select ${selected.name}` : 'Select a card above'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
