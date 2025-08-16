import { useContext } from 'react'
import {
  BlueskyIcon,
  BlueskyShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  ThreadsIcon,
  ThreadsShareButton,
  TwitterShareButton,
  VKIcon,
  VKShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from 'react-share'
import { Button } from '@/components/ui/button.tsx'
import { toast } from '@/hooks/use-toast'
import { UserContext } from '@/lib/context/UserContext.ts'
import { cn } from '@/lib/utils'

export const SocialShareButtons = ({ className }: { className?: string }) => {
  const { account } = useContext(UserContext)
  const collectionShareUrl = `https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}`
  const tradeShareUrl = `https://tcgpocketcollectiontracker.com/#/trade/${account?.friend_id}`
  const title = 'My Pokemon Pocket collection'

  return (
    <div className={cn('flex gap-2 items-center flex-wrap', className)}>
      <small>Share on</small>
      <Button
        variant="outline"
        onClick={async () => {
          toast({ title: 'Copied trading page URL to clipboard!', variant: 'default', duration: 3000 })
          await navigator.clipboard.writeText(tradeShareUrl)
        }}
      >
        Copy link
      </Button>

      <FacebookShareButton url={collectionShareUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={collectionShareUrl} title={title}>
        <XIcon size={32} round />
      </TwitterShareButton>
      <RedditShareButton url={collectionShareUrl} title={title} windowWidth={660} windowHeight={460}>
        <RedditIcon size={32} round />
      </RedditShareButton>
      <PinterestShareButton url={String(window.location)} media="https://tcgpocketcollectiontracker.com/images/en-US/A1_285_EN.webp">
        <PinterestIcon size={32} round />
      </PinterestShareButton>
      <LinkedinShareButton url={collectionShareUrl}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={collectionShareUrl} title={title} separator=":: ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={collectionShareUrl} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <VKShareButton url={collectionShareUrl} image="https://tcgpocketcollectiontracker.com/images/en-US/A1_285_EN.webp">
        <VKIcon size={32} round />
      </VKShareButton>
      <ThreadsShareButton url={collectionShareUrl} title={title}>
        <ThreadsIcon size={32} round />
      </ThreadsShareButton>
      <BlueskyShareButton url={collectionShareUrl} title={title} windowWidth={660} windowHeight={460}>
        <BlueskyIcon size={32} round />
      </BlueskyShareButton>
    </div>
  )
}
