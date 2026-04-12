import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import type * as React from 'react'
import { cn } from '@/lib/utils'

export function NavigationMenu({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  )
}

export function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.NavigationMenuListProps) {
  return <NavigationMenuPrimitive.List className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...props} />
}

export const NavigationMenuLink = NavigationMenuPrimitive.Link

export function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.NavigationMenuViewportProps) {
  return (
    <div className={cn('absolute top-full left-0 flex justify-center')}>
      <NavigationMenuPrimitive.Viewport
        className={cn(
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top-center overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow data-[state=closed]:animate-out data-[state=open]:animate-in md:w-[var(--radix-navigation-menu-viewport-width)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}
