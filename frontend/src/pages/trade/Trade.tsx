import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TradeCards from './TradeCards.tsx'
import TradeOffers from './TradeOffers'
import TradeSettings from './TradeSettings.tsx'

function Trade() {
  const { t } = useTranslation('trade-matches')
  return (
    <Tabs className="flex flex-col mx-auto max-w-[900px]" defaultValue="offers">
      <TabsList className="gap-4 mb-6 rounded-lg border-b-1 border-neutral-700 border-solid dark:bg-transparent pb-2">
        <TabsTrigger className="text-md" value="cards">
          {t('tabCards')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="offers">
          {t('tabOffers')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="settings">
          {t('tabSettings')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="cards">
        <TradeCards />
      </TabsContent>
      <TabsContent value="offers">
        <TradeOffers />
      </TabsContent>
      <TabsContent value="settings">
        <TradeSettings />
      </TabsContent>
    </Tabs>
  )
}

export default Trade
