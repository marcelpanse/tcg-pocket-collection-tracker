import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TradeWith from '@/pages/trade/TradeWith.tsx'
import TradeCards from './TradeCards.tsx'
import TradeMatches from './TradeMatches'
import TradeOffers from './TradeOffers'
import TradeSettings from './TradeSettings.tsx'

function Trade() {
  const { t } = useTranslation('trade-matches')
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = location.pathname.split('/').pop() || 'offers'

  useEffect(() => {
    // Redirect to offers if at /trade
    if (location.pathname === '/trade') {
      navigate('/trade/offers')
    }
  }, [location.pathname, navigate])

  return (
    <Tabs className="flex flex-col mx-auto max-w-[900px]" value={currentTab} onValueChange={(value) => navigate(`/trade/${value}`)}>
      <TabsList className="gap-4 mb-6 rounded-lg border-b-1 border-neutral-700 border-solid dark:bg-transparent pb-2">
        <TabsTrigger className="text-md" value="cards">
          {t('tabCards')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="offers">
          {t('tabOffers')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="matches">
          {t('tabMatches')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="settings">
          {t('tabSettings')}
        </TabsTrigger>
      </TabsList>
      <Routes>
        <Route path="/" element={<Navigate to="/trade/offers" replace />} />
        <Route path="cards" element={<TradeCards />} />
        <Route path="offers" element={<TradeOffers />} />
        <Route path="matches" element={<TradeMatches />} />
        <Route path="settings" element={<TradeSettings />} />
        <Route path=":friendId" element={<TradeWith />} />
      </Routes>
    </Tabs>
  )
}

export default Trade
