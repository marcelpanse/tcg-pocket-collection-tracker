import type React from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
  return (
    <div className={cn('max-h-[300px] overflow-y-auto border border-gray-300 rounded-md', className)} style={{ maxHeight: '300px' }}>
      {children}
    </div>
  )
}

export default ScrollArea
