import { Copy } from 'lucide-react'
import type { FC } from 'react'
import { useToast } from '@/hooks/use-toast.ts'
import { cn, formatFriendId } from '@/lib/utils'
import { Button } from './button'

interface FriendIdDisplayProps {
  friendId: string
  className?: string
  showCopyButton?: boolean
}

export const FriendIdDisplay: FC<FriendIdDisplayProps> = ({ friendId, className = '', showCopyButton = true }) => {
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(friendId)
      toast({
        title: 'Friend ID copied to clipboard!',
        variant: 'default',
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to copy friend ID:', error)
      toast({
        title: 'Failed to copy friend ID',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  if (!friendId) {
    return null
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="font-mono">{formatFriendId(friendId)}</span>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-4 w-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          aria-label="Copy friend ID"
        >
          <Copy className="h-2.5 w-2.5" />
        </Button>
      )}
    </span>
  )
}
