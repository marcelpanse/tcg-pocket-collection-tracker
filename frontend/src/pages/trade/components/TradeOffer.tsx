import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/Auth.ts'
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
      return <span className="w-1/2 text-center">–</span>
    }
    return (
      <span className="flex w-1/2">
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

  return (
    <div className="rounded-lg border-1 border-neutral-700 border-solid p-2 text-center">
      <div className="flex justify-between mx-2 mb-2">
        <h4 className="text-lg font-medium">{t('youGive')}</h4>
        <h4 className="text-lg font-medium">{t('youReceive')}</h4>
      </div>
      <div className="flex justify-between rounded bg-zinc-800 px-1 mt-2">
        {yourCard || friendCard ? (
          <>
            {card(yourCard)}
            {card(friendCard)}
          </>
        ) : (
          <span className="w-full text-center">{t('selectCardsToTrade')}</span>
        )}
      </div>
      <Button className="text-center mt-4" type="button" variant="outline" onClick={submit} disabled={!enabled}>
        {t('offerTrades')}
      </Button>
    </div>
  )
}
