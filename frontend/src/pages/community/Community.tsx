import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Board } from './components/Board'

function Community() {
  const { t } = useTranslation('pages/community')

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-y-4 px-4">
      <h1 className="text-3xl font-bold">{t('community')}</h1>
      <Tabs defaultValue="announcements">
        <TabsList className="w-full flex-wrap h-auto border-2 border-slate-600 rounded-md">
          <TabsTrigger value="announcements">{t('announcements')}</TabsTrigger>
          <TabsTrigger value="trade">{t('trade')}</TabsTrigger>
          <TabsTrigger value="feedback">{t('ideasFeedback')}</TabsTrigger>
          <Button variant={'ghost'} size="sm" onClick={() => window.open('https://github.com/marcelpanse/tcg-pocket-collection-tracker', '_blank')}>
            {t('githubRepository')}
            <ExternalLink />
          </Button>
        </TabsList>
        <TabsContent value="announcements">
          <h1 className="text-lg mt-4">{t('announcements')} 🚀</h1>
          <p className="text-sm mb-10">{t('announcementsText')}</p>
          <Board term="app/announcements" />
        </TabsContent>
        <TabsContent value="trade">
          <h1 className="text-lg mt-4">{t('trade')} 💰</h1>
          <p className="text-sm mb-10">{t('tradeText')}</p>
          <Board term="app/trade" />
        </TabsContent>
        <TabsContent value="feedback">
          <h1 className="text-lg mt-4">{t('ideasFeedback')} 💡</h1>
          <p className="text-sm mb-10">{t('ideasFeedbackText')}</p>
          <Board term="app/feedback" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Community
