import { useTranslation } from 'react-i18next'
import PotentialTradePartner from '@/pages/trade/components/PotentialTradePartner.tsx'
import { useTradingPartners } from '@/services/trade/useTrade.ts'

function TradeMatches() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: tradingPartners, isLoading } = useTradingPartners()

  if (isLoading) {
    return <p>{t('common:loading')}</p>
  }

  if (!tradingPartners?.length) {
    return <p>{t('noTradePartners')}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {tradingPartners.map((partner) => (
        <PotentialTradePartner key={partner.friend_id} partner={partner} />
      ))}
    </div>
  )
}

export default TradeMatches
