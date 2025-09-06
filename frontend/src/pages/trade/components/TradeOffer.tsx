import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/supabase'
import { getCardNameByLang } from '@/lib/utils'
import type { Card, TradeRow } from '@/types'

interface Props {
  yourId: string
  friendId: string
  yourCard: Card | null
  friendCard: Card | null
  setYourCard: (card: Card | null) => void
  setFriendCard: (card: Card | null) => void
}

export const TradeOffer: FC<Props> = ({ yourId, friendId, yourCard, friendCard, setYourCard, setFriendCard }) => {
  const { t, i18n } = useTranslation('trade-matches')
  const { toast } = useToast()

  function card(c: Card | null) {
    if (!c) {
      return '—'
    }
    return (
      <span className="flex">
        <span className="min-w-10">{c.rarity} </span>
        <span className="min-w-14 me-4">{c.card_id} </span>
        <span>{getCardNameByLang(c, i18n.language)}</span>
      </span>
    )
  }

  const enabled = yourCard && friendCard && yourCard.rarity === friendCard.rarity

  async function submit() {
    if (!enabled) {
      return
    }
    const trade: TradeRow = {
      offering_friend_id: yourId,
      receiving_friend_id: friendId,
      offer_card_id: yourCard.card_id,
      receiver_card_id: friendCard.card_id,
      status: 'offered',
    } as TradeRow
    const { error } = await supabase.from('trades').insert(trade)
    if (error) {
      console.log(error)
      toast({ title: t('tradeFailed'), variant: 'default' })
    } else {
      setYourCard(null)
      setFriendCard(null)
      toast({ title: t('tradeOffered'), variant: 'default' })
    }
  }

  if (!yourCard && !friendCard) {
    return (
      <div className="flex rounded-lg border-1 border-neutral-700 border-solid p-2 w-full items-center justify-around text-center h-[206px] sm:h-[138px]">
        <h4 className="text-lg font-medium">{t('selectCardsToTrade')}</h4>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-lg border-1 border-neutral-700 border-solid p-2">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="w-full sm:w-1/2">
          <h4 className="text-lg font-medium">{t('youGive')}</h4>
          {card(yourCard)}
        </div>
        <div className="w-full sm:w-1/2">
          <h4 className="text-lg font-medium">{t('youReceive')}</h4>
          {card(friendCard)}
        </div>
      </div>
      <Button className="block w-full sm:w-1/2 mx-auto text-center" type="button" variant="outline" onClick={submit} disabled={!enabled}>
        {t('offerTrades')}
      </Button>
    </div>
  )
}
