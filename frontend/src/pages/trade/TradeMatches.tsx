import { useTranslation } from 'react-i18next'
import PotentialTradePartner from '@/pages/trade/components/PotentialTradePartner.tsx'
import { useTradingPartners } from '@/services/trade/useTrade.ts'

function TradeMatches() {
  const { t } = useTranslation(['trade-matches', 'common'])

  const { data: tradingPartners, isLoading, isError } = useTradingPartners()

  if (isLoading) {
    return (
      <p className="text-xl text-center py-8">
        {t('common:loading')}
        <br />
        {t('longOperation')}
      </p>
    )
  }

  if (isError) {
    return <p className="text-xl text-center py-8">{t('common:error')}</p>
  }

  if (!tradingPartners?.length) {
    return <p className="text-xl text-center py-8">{t('noTradePartners')}</p>
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
