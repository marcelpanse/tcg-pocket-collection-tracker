import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import type { TradePartners } from '@/types'

interface PotentialTradePartnerProps {
  partner: TradePartners
}

function PotentialTradePartner({ partner }: PotentialTradePartnerProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('trade-matches')

  return (
    <div className="max-w-md w-full flex justify-between items-center mx-auto px-4">
      <p className="mr-2">{partner.username}</p>
      <Button variant="outline" className="my-auto" onClick={() => navigate(`/trade/${partner.friend_id}`)}>
        {t('viewTradePartner')}
        <ChevronRight />
      </Button>
    </div>
  )
}

export default PotentialTradePartner
