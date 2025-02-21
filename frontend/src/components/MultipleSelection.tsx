import { Button } from '@/components/ui/button.tsx'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

interface MultipleSelectionProps {
  onMarkAllAsOwned: (value: number | null) => void
}

export function MultipleSelection({ onMarkAllAsOwned }: MultipleSelectionProps) {
  const [customValue, setCustomValue] = useState<number | null>(null)

  const handleDecrement = () => {
    if (customValue !== null) {
      if (customValue > 0) {
        setCustomValue((prev) => prev - 1)
      } else if (customValue === 0) {
        setCustomValue(null)
      }
    }
  }

  const handleIncrement = () => {
    setCustomValue((prev) => (prev ? prev + 1 : 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value === '') {
      setCustomValue(null)
    } else {
      const numericValue = Number(value)
      if (!Number.isNaN(numericValue)) {
        setCustomValue(numericValue < 0 ? null : numericValue)
      } else {
        setCustomValue(null)
      }
    }
  }

  const handleMarkAllAsOwned = () => {
    if (customValue !== null) {
      onMarkAllAsOwned(customValue)
      setCustomValue(null)
    }
  }

  return (
    <div className="flex items-center gap-1 justify-end shadow-none border-2 border-slate-600 rounded-md flex-row">
      <div className="flex items-center gap-x-1">
        <Button variant="ghost" size="icon" onClick={handleDecrement} disabled={customValue === null || customValue === 0} className="rounded-full">
          <MinusIcon size={14} />
        </Button>
        <input
          type="text"
          min="0"
          value={customValue ?? ''}
          onChange={handleInputChange}
          className="w-7 text-center border-none rounded"
          onFocus={(event) => event.target.select()}
        />
        <Button variant="ghost" size="icon" onClick={handleIncrement} className="rounded-full">
          <PlusIcon size={14} />
        </Button>
      </div>

      <Button variant="ghost" onClick={handleMarkAllAsOwned} disabled={customValue === null} className="ml-2">
        {customValue !== null ? `Mark All as ${customValue}` : 'Select a Value'}
      </Button>
    </div>
  )
}
