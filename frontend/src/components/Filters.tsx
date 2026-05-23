import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

const commonClassName = 'rounded-md border-1 border-neutral-700 bg-neutral-800'

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
    <div className="inline-block">
      {label && (
        <span className="block w-fit bg-neutral-800 border border-b-0 rounded-t-md border-neutral-700 text-neutral-400 px-4 py-0.5 text-xs relative">
          {label}
        </span>
      )}
      <Tabs value={value} onValueChange={(x) => onChange(x as T)}>
        <TabsList className={cn(commonClassName, 'flex-wrap block', className, label && 'rounded-tl-none -mt-px')}>
          {options.map((x) => (
            <TabsTrigger className="rounded-sm" key={x} value={x}>
              {show(x)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
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

interface PropsToggle<T> extends Props<T> {
  value: T[]
  onChange: (value: T[]) => void
}

export function ToggleFilter<T extends string>({ options, value, onChange, className, show = (x) => x }: PropsToggle<T>) {
  return (
    <ToggleGroup type="multiple" className={cn(commonClassName, 'flex flex-wrap justify-start', className)} value={value} onValueChange={onChange}>
      {options.map((x) => (
        <ToggleGroupItem key={x} value={x} aria-label={x}>
          {show(x)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
