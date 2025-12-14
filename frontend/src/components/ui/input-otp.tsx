import { OTPInput, OTPInputContext, type OTPInputProps } from 'input-otp'
import * as React from 'react'

import { cn } from '@/lib/utils'

export function InputOTP({ className, containerClassName, ...props }: OTPInputProps) {
  return (
    <OTPInput
      containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

export function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center', className)} {...props} />
}

export function InputOTPSlot({ index, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]
  return (
    <div
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-y border-r border-neutral-200 text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md dark:border-neutral-800',
        isActive && 'z-10 ring-1 ring-neutral-950 dark:ring-neutral-300',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-neutral-950 duration-1000 dark:bg-neutral-50" />
        </div>
      )}
    </div>
  )
}
