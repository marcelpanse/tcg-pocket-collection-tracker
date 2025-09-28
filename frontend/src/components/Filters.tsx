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
  onChange: (value: T) => void
}

export function TabsFilter<T extends string>({ options, value, onChange, className, show = (x) => x }: PropsTabs<T>) {
  return (
    <Tabs value={value} onValueChange={(x) => onChange(x as T)}>
      <TabsList className={cn(commonClassName, className)}>
        {options.map((x) => (
          <TabsTrigger key={x} value={x}>
            {show(x)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

interface PropsDropdown<T> extends Props<T> {
  label: string
  value: T
  onChange: (value: T) => void
}

export function DropdownFilter<T extends string | number>({ label, options, value, onChange, className, show = (x) => String(x) }: PropsDropdown<T>) {
  return (
    <label className={cn(commonClassName, 'flex items-baseline justify-between gap-5 px-3 py-1 my-auto text-neutral-400', className)}>
      <span className="text-sm">{label}</span>
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
  asChild?: boolean
}

export function ToggleFilter<T extends string>({ options, value, onChange, className, show = (x) => x, asChild }: PropsToggle<T>) {
  return (
    <ToggleGroup type="multiple" size="sm" className={cn(commonClassName, 'flex flex-wrap justify-center', className)} value={value} onValueChange={onChange}>
      {options.map((x) => (
        <ToggleGroupItem key={x} value={x} aria-label={x} className="text-gray-400 hover:text-gray-500 px-1 cursor-pointer" asChild={asChild}>
          {show(x)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
