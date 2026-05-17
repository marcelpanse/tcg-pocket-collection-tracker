import { ChevronsDown, ChevronsUp } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { CardLine } from '@/components/CardLine'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { umami } from '@/lib/utils.ts'
import { useInsertTrade } from '@/services/trade/useTrade.ts'
import type { Card, TradeRow } from '@/types'

function OfferCard({ card }: { card: Card | null }) {
  return card === null ? (
    <span className="inline-block mx-auto">—</span>
  ) : (
    <CardLine className="flex-1 bg-neutral-900" card_id={card.card_id} details="hidden" />
  )
}

interface Props {
  yourId: string
  friendId: string
  yourCard: Card | null
  friendCard: Card | null
  setYourCard: (card: Card | null) => void
  setFriendCard: (card: Card | null) => void
}

export const TradeOffer: FC<Props> = ({ yourId, friendId, yourCard, friendCard, setYourCard, setFriendCard }) => {
  const { t } = useTranslation('trade-matches')
  const { toast } = useToast()

  const insertTradeMutation = useInsertTrade()

  const enabled = yourCard && friendCard && yourCard.rarity === friendCard.rarity

  async function submit() {
    if (!enabled) {
      return
    }
    if (!yourId?.match(/^\d{16}$/)) {
      toast({ title: t('noAccount'), variant: 'destructive' })
      return
    }
    const trade: TradeRow = {
      offering_friend_id: yourId,
      receiving_friend_id: friendId,
      offer_card_id: yourCard.card_id,
      receiver_card_id: friendCard.card_id,
      status: 'offered',
    } as TradeRow
    try {
      await insertTradeMutation.mutateAsync(trade)
      setYourCard(null)
      setFriendCard(null)
      toast({ title: t('tradeOffered'), variant: 'default' })
      umami('Offer trade')
    } catch (e) {
      console.log('TradeOffer: Error inserting trade', e)
      toast({ title: t('tradeFiled'), variant: 'destructive' })
    }
  }

  if (!yourCard && !friendCard) {
    return (
      <div className="sticky top-0 z-10 flex rounded-lg border-1 bg-neutral-800 border-neutral-700 border-solid p-2 w-full items-center justify-around text-center h-[110px] sm:h-[82px]">
        <h4 className="text-lg font-medium text-neutral-400">{t('selectCardsToTrade')}</h4>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-10 bg-neutral-800 rounded-lg border-1 border-neutral-700 border-solid p-1">
      <div className="flex flex-col-reverse sm:flex-row gap-x-4 gap-y-1 p-1">
        <div className="flex w-full sm:w-1/2">
          <ChevronsUp />
          <OfferCard card={yourCard} />
        </div>
        <div className="flex w-full sm:w-1/2">
          <ChevronsDown />
          <OfferCard card={friendCard} />
        </div>
      </div>
      <Button className="block w-full sm:w-96 mx-auto mt-1 text-center" variant="default" onClick={submit} disabled={!enabled}>
        {t('offerTrades')}
      </Button>
    </div>
  )
}
