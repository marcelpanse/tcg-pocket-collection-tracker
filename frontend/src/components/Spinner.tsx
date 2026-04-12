import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('rounded-full animate-spin border-current border-t-transparent', {
  variants: {
    size: {
      inline: 'border-2 size-[1em]',
      md: 'border-4 size-12',
      lg: 'border-6 size-16',
    },
  },
  defaultVariants: {
    size: 'inline',
  },
})

interface Props extends VariantProps<typeof spinnerVariants> {
  className?: string
  overlay?: boolean
}

export function Spinner({ className, overlay, ...variant }: Props) {
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(spinnerVariants(variant), className)} />
      </div>
    )
  } else {
    return <div className={cn(spinnerVariants(variant), className)} />
  }
}
