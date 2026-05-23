import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return <TabsPrimitive.List className={cn('space-x-1 p-1', className)} {...props} />
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm text-neutral-400 focus-visible:ring-2 ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-neutral-600 data-[state=active]:text-neutral-300 hover:bg-neutral-700 hover:text-neutral-300 focus-visible:ring-neutral-300 cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300',
        className,
      )}
      {...props}
    />
  )
}
