import * as RadioPrimitive from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

export const Radio = RadioPrimitive.Root

export function RadioItem({ className, ...props }: RadioPrimitive.RadioGroupItemProps) {
  return <RadioPrimitive.Item className={cn('w-4 h-4 mr-2 rounded-full bg-neutral-700 hover:bg-neutral-500', className)} {...props} />
}

export function RadioIndicator({ className, ...props }: RadioPrimitive.RadioGroupIndicatorProps) {
  return <RadioPrimitive.Indicator className={cn('w-2 h-2 mx-1 xm-auto my-auto rounded-full flex bg-neutral-300', className)} {...props} />
}
