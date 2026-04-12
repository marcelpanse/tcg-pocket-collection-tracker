import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export function Progress({ className, value, barColor, ...props }: ProgressPrimitive.ProgressProps & { barColor?: string }) {
  return (
    <ProgressPrimitive.Root className={cn('relative h-2 w-full overflow-hidden rounded-full bg-neutral-900/20 dark:bg-neutral-50/20', className)} {...props}>
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-neutral-900 transition-all dark:bg-neutral-50"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: barColor,
        }}
      />
    </ProgressPrimitive.Root>
  )
}
