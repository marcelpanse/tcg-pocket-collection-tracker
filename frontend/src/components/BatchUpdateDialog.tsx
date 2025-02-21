import { CardMiniature } from '@/components/CardMiniature'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ScrollArea from '@/components/ui/scroll-area'
import type { Card } from '@/types'
import { MinusIcon, PlusIcon } from 'lucide-react'
// src/components/BatchUpdateDialog.tsx
import { useEffect, useMemo, useState } from 'react' // Add useEffect

interface BatchUpdateDialogProps {
  filteredCards: Card[]
  onBatchUpdate: (cardIds: string[], amount: number) => void
  disabled?: boolean
}

export function BatchUpdateDialog({ filteredCards, onBatchUpdate }: BatchUpdateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(0)
  const [selectedCards, setSelectedCards] = useState<Record<string, boolean>>({})
  const isBatchUpdateDisabled = filteredCards.length === 0
  const uniqueCards = useMemo(() => {
    return filteredCards.reduce((acc, card) => {
      if (!acc.some((c) => c.card_id === card.card_id)) {
        acc.push(card)
      }
      return acc
    }, [] as Card[])
  }, [filteredCards])

  useEffect(() => {
    if (isOpen) {
      const initialSelectedCards = uniqueCards.reduce(
        (acc, card) => {
          acc[card.card_id] = true
          return acc
        },
        {} as Record<string, boolean>,
      )
      setSelectedCards(initialSelectedCards)
    }
  }, [isOpen])

  const handleSelect = (cardId: string, selected: boolean) => {
    setSelectedCards((prev) => ({ ...prev, [cardId]: selected }))
  }

  const handleSelectAll = () => {
    const allSelected = uniqueCards.reduce(
      (acc, card) => {
        acc[card.card_id] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setSelectedCards(allSelected)
  }

  const handleDeselectAll = () => {
    const allDeselected = uniqueCards.reduce(
      (acc, card) => {
        acc[card.card_id] = false
        return acc
      },
      {} as Record<string, boolean>,
    )
    setSelectedCards(allDeselected)
  }

  const selectedCount = Object.values(selectedCards).filter((selected) => selected).length

  const handleDecrement = () => {
    if (amount !== null) {
      if (amount > 0) {
        setAmount((prev) => (prev || 0) - 1)
      } else if (amount === 0) {
        setAmount(0)
      }
    }
  }

  const handleIncrement = () => {
    setAmount((prev) => (prev ? prev + 1 : 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value === '') {
      setAmount(0)
    } else {
      const numericValue = Number(value)
      if (!Number.isNaN(numericValue)) {
        setAmount(numericValue < 0 ? 0 : numericValue)
      } else {
        setAmount(0)
      }
    }
  }

  const handleConfirm = () => {
    const cardIds = Object.entries(selectedCards)
      .filter(([_, selected]) => selected)
      .map(([cardId]) => cardId)

    if (cardIds.length > 0) {
      onBatchUpdate(cardIds, amount)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)} disabled={isBatchUpdateDisabled}>
        Batch Update
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Batch Update Cards</DialogTitle>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertDescription>
              You are about to batch update{' '}
              <strong>
                <span
                  style={{
                    fontSize: '1.25rem',
                    color: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    margin: '0 0.25rem',
                  }}
                >
                  {selectedCount}
                </span>{' '}
                cards
              </strong>{' '}
              based on your selected filters. Select the amount you'd like to set for each of the cards below.{' '}
              <strong>Beware that this will overwrite all current values of the selected cards!</strong>{' '}
              <strong>You can also select or deselect individual cards if you don’t want to update all of them.</strong>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-between">
            <Button variant="outline" onClick={handleDeselectAll}>
              Deselect All
            </Button>
            <Button variant="outline" onClick={handleSelectAll}>
              Select All
            </Button>
          </div>

          <ScrollArea className="h-64 rounded-md border p-4">
            <div className="grid grid-cols-6 gap-2">
              {uniqueCards.map((card) => (
                <CardMiniature key={card.card_id} card={card} onSelect={handleSelect} selected={selectedCards[card.card_id]} />
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-x-1 justify-center">
            <Button variant="ghost" size="icon" onClick={handleDecrement} disabled={amount === null || amount === 0} className="rounded-full">
              <MinusIcon size={14} />
            </Button>
            <input
              type="text"
              min="0"
              value={amount ?? 0}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-7 text-center border-none rounded"
              onFocus={(event) => event.target.select()}
            />
            <Button variant="ghost" size="icon" onClick={handleIncrement} className="rounded-full">
              <PlusIcon size={14} />
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedCount === 0} variant="ghost">
              Batch Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
