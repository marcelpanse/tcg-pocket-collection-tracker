import * as SwitchPrimitive from '@radix-ui/react-switch'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-neutral-900 data-[state=unchecked]:bg-neutral-200 focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 dark:data-[state=unchecked]:bg-neutral-200/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-neutral-200 shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:data-[state=checked]:bg-green-400 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 dark:dark:data-[state=unchecked]:bg-neutral-800/80 dark:border-neutral-800',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-white dark:data-[state=unchecked]:bg-neutral-700 dark:data-[state=checked]:bg-neutral-50 pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:bg-neutral-950 dark:dark:data-[state=unchecked]:bg-neutral-50 dark:dark:data-[state=checked]:bg-neutral-900',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
