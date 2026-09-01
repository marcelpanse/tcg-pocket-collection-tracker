import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

const commonClassName = 'rounded-md border-1 border-neutral-700 bg-neutral-800'

function FilterField({ label, children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  if (!label) {
    return <div className={className}>{children}</div>
  }
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 px-0.5">{label}</span>
      {children}
    </div>
  )
}

interface Props<T> {
  options: readonly T[]
  show?: (x: T) => React.ReactNode
  className?: string
}

interface PropsTabs<T> extends Props<T> {
  value: T
  label?: string
  onChange: (value: T) => void
}

export function TabsFilter<T extends string>({ options, value, onChange, className, label, show = (x) => x }: PropsTabs<T>) {
  return (
    <FilterField label={label}>
      <Tabs value={value} onValueChange={(x) => onChange(x as T)}>
        <TabsList className={cn(commonClassName, 'flex-wrap block', className)}>
          {options.map((x) => (
            <TabsTrigger className="rounded-sm" key={x} value={x}>
              {show(x)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </FilterField>
  )
}

interface PropsDropdown<T> extends Props<T> {
  label?: string
  value: T
  onChange: (value: T) => void
}

export function DropdownFilter<T extends string | number>({ label, options, value, onChange, className, show = (x) => String(x) }: PropsDropdown<T>) {
  return (
    <label className={cn(commonClassName, 'flex items-baseline justify-between gap-4 px-2 py-1 text-neutral-400', className)}>
      {label && <span className="text-sm ml-1">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="min-h-[27px] text-sm text-right cursor-pointer">
        {options.map((x) => (
          <option key={x} value={x}>
            {show(x)}
          </option>
        ))}
      </select>
    </label>
  )
}

interface PropsRange<T> {
  label: string
  minOptions: readonly T[]
  maxOptions: readonly T[]
  minValue: T
  maxValue: T
  onMinChange: (value: T) => void
  onMaxChange: (value: T) => void
  className?: string
}

/** A min/max pair rendered as a single control: `HP   0 – ∞` */
export function RangeFilter<T extends string | number>({
  label,
  minOptions,
  maxOptions,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className,
}: PropsRange<T>) {
  // Fixed width so every range row lines up, regardless of how wide each filter's widest option is.
  const selectClassName = 'min-h-[27px] w-14 text-sm text-right text-neutral-300 cursor-pointer'
  return (
    <div className={cn(commonClassName, 'flex items-center justify-between gap-4 px-3 py-1 text-neutral-400', className)}>
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        <select aria-label={`${label} min`} value={minValue} onChange={(e) => onMinChange(e.target.value as T)} className={selectClassName}>
          {minOptions.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <select aria-label={`${label} max`} value={maxValue} onChange={(e) => onMaxChange(e.target.value as T)} className={selectClassName}>
          {maxOptions.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface PropsToggle<T> extends Props<T> {
  value: T[]
  onChange: (value: T[]) => void
  label?: string
  selectAllLabel?: string
  clearAllLabel?: string
}

export function ToggleFilter<T extends string>({ options, value, onChange, className, show = (x) => x, label, selectAllLabel, clearAllLabel }: PropsToggle<T>) {
  const allSelected = value.length === options.length
  return (
    <FilterField label={label}>
      <ToggleGroup type="multiple" className={cn(commonClassName, 'flex flex-wrap justify-start', className)} value={value} onValueChange={onChange}>
        {options.map((x) => (
          <ToggleGroupItem key={x} value={x} aria-label={x}>
            {show(x)}
          </ToggleGroupItem>
        ))}
        {selectAllLabel && (
          <button
            type="button"
            onClick={() => onChange(allSelected ? [] : [...options])}
            className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-300 px-2 py-1 ml-auto"
          >
            {allSelected && clearAllLabel ? clearAllLabel : selectAllLabel}
          </button>
        )}
      </ToggleGroup>
    </FilterField>
  )
}
