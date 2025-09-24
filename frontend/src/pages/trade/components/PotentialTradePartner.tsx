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
    <div className="w-md">
      <div className="flex justify-between items-center mb-2 mx-1">
        <p>{partner.username}</p>
        <span className="flex gap-4">
          <Button variant="outline" className="my-auto" onClick={() => navigate(`/trade/${partner.friend_id}`)}>
            {t('viewTradePartner')}
            <ChevronRight />
          </Button>
        </span>
      </div>
    </div>
  )
}

export default PotentialTradePartner
