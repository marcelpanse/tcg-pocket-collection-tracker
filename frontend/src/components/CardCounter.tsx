import { Button } from '@/components/ui/button.tsx'
import { MinusIcon, PlusIcon } from 'lucide-react'

interface CardCounterProps {
  cardID: string
  count: number
  onIncrement: () => void
  onDecrement: () => void
  onInputChange?: (value: number) => void // Optional
  inputClassName?: string // Allows customizing input styles
  buttonSize?: 'lg' | 'icon' // Allows different button sizes
}

const CardCounter = ({
  count,
  onIncrement,
  onDecrement,
  onInputChange,
  inputClassName = 'w-16 text-center border border-gray-300 rounded p-2 text-xl',
  buttonSize = 'lg',
}: CardCounterProps) => {
  return (
    <div className="flex items-center gap-x-1">
      <Button variant="ghost" size={buttonSize} onClick={onDecrement} className="rounded-full">
        <MinusIcon />
      </Button>
      <input
        type="text"
        value={count}
        onChange={onInputChange ? (e) => onInputChange(Number.parseInt(e.target.value) || 0) : undefined}
        className={inputClassName}
        readOnly={!onInputChange} // If no handler, make input read-only
      />
      <Button variant="ghost" size={buttonSize} onClick={onIncrement} className="rounded-full">
        <PlusIcon />
      </Button>
    </div>
  )
}

export default CardCounter
