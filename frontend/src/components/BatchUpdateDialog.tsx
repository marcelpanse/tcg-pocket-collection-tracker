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
  onBatchUpdate: (cardIds: string[], amount: number) => Promise<void>
  disabled?: boolean
}

export function BatchUpdateDialog({ filteredCards, onBatchUpdate }: BatchUpdateDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(0)
  const [selectedCards, setSelectedCards] = useState<Record<string, boolean>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [changesMade, setChangesMade] = useState(false)

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
    if (!isOpen) {
      setChangesMade(false)
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
    setChangesMade(true)
  }

  const handleIncrement = () => {
    setAmount((prev) => (prev ? prev + 1 : 1))
    setChangesMade(true)
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
    setChangesMade(true)
  }

  const handleConfirm = async () => {
    setIsProcessing(true)

    const cardIds = Object.entries(selectedCards)
      .filter(([_, selected]) => selected)
      .map(([cardId]) => cardId)

    if (cardIds.length > 0) {
      await onBatchUpdate(cardIds, amount)
      setIsOpen(false)
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)} disabled={isBatchUpdateDisabled}>
        Bulk update
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk update cards</DialogTitle>
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
              based on your selected filters. Select the amount you'd like to set for each of the cards below. You can also select or deselect individual cards
              if you don’t want to update all of them. <strong>Beware that this will overwrite all current values of the selected cards!</strong>{' '}
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
            <Button onClick={handleConfirm} disabled={selectedCount === 0 || isProcessing || !changesMade} variant="default">
              {isProcessing && (
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              )}
              Batch {isProcessing ? 'processing...' : 'update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
