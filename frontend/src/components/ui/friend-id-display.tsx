import { Copy, MessageSquare, QrCode } from 'lucide-react'
import { type FC, useContext } from 'react'
import { DialogContext } from '@/context/DialogContext'
import { useToast } from '@/hooks/use-toast.ts'
import { cn, formatFriendId } from '@/lib/utils'
import { Button } from './button'

interface FriendIdDisplayProps {
  friendId: string
  className?: string
  showCopyButton?: boolean
  showFriendId?: boolean
  showQrCode?: boolean
  onChat?: () => void
}

export const FriendIdDisplay: FC<FriendIdDisplayProps> = ({
  friendId,
  className = '',
  showFriendId = true,
  showCopyButton = true,
  showQrCode = true,
  onChat,
}) => {
  const { toast } = useToast()
  const { setFriendIdQrCode } = useContext(DialogContext)

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
      {showFriendId && <span className="font-mono">{formatFriendId(friendId)}</span>}
      {showCopyButton && (
        <Button
          title="copy id"
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="size-4 text-neutral-400 hover:text-neutral-200"
          aria-label="Copy friend ID"
        >
          <Copy className="h-2.5 w-2.5" />
        </Button>
      )}
      {showQrCode && (
        <Button
          title="open qr code"
          variant="ghost"
          size="icon"
          onClick={() => setFriendIdQrCode(friendId)}
          className="size-4 text-neutral-400 hover:text-neutral-200"
          aria-label="Open Qr Code"
        >
          <QrCode className="size-4" />
        </Button>
      )}
      {onChat && (
        <Button
          title="open chat"
          variant="ghost"
          size="icon"
          onClick={onChat}
          className="size-4 text-neutral-400 hover:text-neutral-200"
          aria-label="Open chat"
        >
          <MessageSquare className="h-2.5 w-2.5" />
        </Button>
      )}
    </span>
  )
}
