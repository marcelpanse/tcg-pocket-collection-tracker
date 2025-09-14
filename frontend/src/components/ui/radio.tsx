import * as RadioPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Radio = RadioPrimitive.Root

const RadioItem = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <RadioPrimitive.Item ref={ref} className={cn('w-4 h-4 mr-2 rounded-full bg-neutral-700 hover:bg-neutral-500', className)} {...props} />
  ),
)
RadioItem.displayName = RadioPrimitive.Item.displayName

const RadioIndicator = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Indicator>, React.ComponentPropsWithoutRef<typeof RadioPrimitive.Indicator>>(
  ({ className, ...props }, ref) => (
    <RadioPrimitive.Indicator ref={ref} className={cn('w-2 h-2 mx-1 xm-auto my-auto rounded-full flex bg-neutral-300', className)} {...props} />
  ),
)
RadioIndicator.displayName = RadioPrimitive.Indicator.displayName

export { Radio, RadioItem, RadioIndicator }
