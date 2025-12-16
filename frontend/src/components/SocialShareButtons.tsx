import { useTranslation } from 'react-i18next'
import {
  BlueskyIcon,
  BlueskyShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
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
import { cn } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount'

export const SocialShareButtons = ({ className }: { className?: string }) => {
  const { t } = useTranslation('socials')
  const { data: account, isLoading } = useAccount()
  const collectionShareUrl = `https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}`
  const tradeShareUrl = `https://tcgpocketcollectiontracker.com/#/trade/${account?.friend_id}`
  const title = 'My Pokemon Pocket collection'
  const copyLink = (link: string) =>
    navigator.clipboard.writeText(link).then(() => toast({ title: 'Copied to clipboard!', variant: 'default', duration: 3000 }))

  if (isLoading) {
    return null
  }

  return (
    <div className={cn('flex gap-2 items-center flex-wrap', className)}>
      <small>{t('shareOn')}</small>

      <FacebookShareButton url={collectionShareUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={collectionShareUrl} title={title}>
        <XIcon size={32} round />
      </TwitterShareButton>
      <RedditShareButton url={collectionShareUrl} title={title} windowWidth={660} windowHeight={460}>
        <RedditIcon size={32} round />
      </RedditShareButton>
      <LinkedinShareButton url={collectionShareUrl}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={collectionShareUrl} title={title} separator=":: ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={collectionShareUrl} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <VKShareButton url={collectionShareUrl}>
        <VKIcon size={32} round />
      </VKShareButton>
      <ThreadsShareButton url={collectionShareUrl} title={title}>
        <ThreadsIcon size={32} round />
      </ThreadsShareButton>
      <BlueskyShareButton url={collectionShareUrl} title={title} windowWidth={660} windowHeight={460}>
        <BlueskyIcon size={32} round />
      </BlueskyShareButton>

      <Button variant="outline" onClick={() => copyLink(tradeShareUrl)} disabled={!account?.is_active_trading}>
        {t('copyTradeLink')}
      </Button>
      <Button variant="outline" onClick={() => copyLink(collectionShareUrl)}>
        {t('copyCollectionLink')}
      </Button>
    </div>
  )
}
