import { QRCodeSVG } from 'qrcode.react'
import { formatFriendId } from '@/lib/utils'
import { Dialog, DialogContent } from './ui/dialog'

interface Props {
  friendId: string | undefined
  onOpenChange: (open: boolean) => void
}

export default function FriendIdQrCodeDialog({ friendId, onOpenChange }: Props) {
  const formated = friendId && formatFriendId(friendId)

  return (
    <Dialog open={Boolean(formated)} onOpenChange={onOpenChange}>
      <DialogContent className="w-fit">
        <p className="max-w-[256px]">Scan this QR code in Pokemon TCG Pocket app to add a friend.</p>
        <QRCodeSVG value={`${formated},${formated}`} size={256} marginSize={2} fgColor="#0a0a0a" bgColor="#ebebeb" />
      </DialogContent>
    </Dialog>
  )
}
