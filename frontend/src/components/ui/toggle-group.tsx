import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type * as React from 'react'

import { cn } from '@/lib/utils'

export function ToggleGroup({ className, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root className={cn('flex flex-wrap justify-start items-center gap-1', className)} {...props}>
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

export function ToggleGroupItem({ className, children, ...props }: ToggleGroupPrimitive.ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'cursor-pointer inline-flex items-center justify-center rounded-sm text-sm font-medium text-neutral-400 bg-transparent focus-visible:outline-none focus-visible:ring-2 ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-neutral-700 hover:text-neutral-300 data-[state=on]:bg-neutral-600 data-[state=on]:text-neutral-300 h-8 px-1 min-w-8',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}
