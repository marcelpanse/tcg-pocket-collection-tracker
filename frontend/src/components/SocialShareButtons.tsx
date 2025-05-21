import { Button } from '@/components/ui/button.tsx'
import { toast } from '@/hooks/use-toast'
import { UserContext } from '@/lib/context/UserContext.ts'
import { type FC, useContext } from 'react'
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

export const SocialShareButtons: FC = () => {
  const { account } = useContext(UserContext)
  const shareUrl = `https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}`
  const title = 'My Pokemon Pocket collection'

  return (
    <div className="flex gap-2 mt-0 items-center flex-wrap">
      <small>Share on</small>
      <Button
        variant="outline"
        onClick={async () => {
          toast({ title: 'Copied trading page URL to clipboard!', variant: 'default', duration: 3000 })
          await navigator.clipboard.writeText(`${shareUrl}/trade`)
        }}
      >
        Copy link
      </Button>

      <FacebookShareButton url={shareUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={shareUrl} title={title}>
        <XIcon size={32} round />
      </TwitterShareButton>
      <RedditShareButton url={shareUrl} title={title} windowWidth={660} windowHeight={460}>
        <RedditIcon size={32} round />
      </RedditShareButton>
      <PinterestShareButton url={String(window.location)} media="https://tcgpocketcollectiontracker.com/images/en-US/A1_285_EN.webp">
        <PinterestIcon size={32} round />
      </PinterestShareButton>
      <LinkedinShareButton url={shareUrl}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={shareUrl} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <VKShareButton url={shareUrl} image="https://tcgpocketcollectiontracker.com/images/en-US/A1_285_EN.webp">
        <VKIcon size={32} round />
      </VKShareButton>
      <ThreadsShareButton url={shareUrl} title={title}>
        <ThreadsIcon size={32} round />
      </ThreadsShareButton>
      <BlueskyShareButton url={shareUrl} title={title} windowWidth={660} windowHeight={460}>
        <BlueskyIcon size={32} round />
      </BlueskyShareButton>
    </div>
  )
}
