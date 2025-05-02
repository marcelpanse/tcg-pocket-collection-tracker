import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { expansions, getCardById } from '@/lib/CardsDB'
import type { Card, CollectionRow, Rarity } from '@/types'
import { type FC, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

interface Props {
  ownedCards: CollectionRow[]
  friendCards: CollectionRow[]
}

// Order of rarities for display
const rarityOrder: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆']

interface TradeCard extends Card {
  amount_owned: number
}

const TradeMatches: FC<Props> = ({ ownedCards, friendCards }) => {
  const { t } = useTranslation('trade-matches')
  const location = useLocation()
  const navigate = useNavigate()

  const [isTradeMatchesDialogOpen, setIsTradeMatchesDialogOpen] = useState(false)

  useEffect(() => {
    if (location.pathname.includes('/collection') && location.pathname.includes('/trade')) {
      if (!isTradeMatchesDialogOpen) {
        setIsTradeMatchesDialogOpen(true)
      }
    } else {
      setIsTradeMatchesDialogOpen(false)
    }
  }, [location])

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  // Cards the friend has 2+ copies of that the user doesn't own
  const friendExtraCards = useMemo(() => {
    const result: Record<Rarity, TradeCard[]> = {
      '◊': [],
      '◊◊': [],
      '◊◊◊': [],
      '◊◊◊◊': [],
      '☆': [],
      '☆☆': [],
      '☆☆☆': [],
      '✵': [],
      '✵✵': [],
      'Crown Rare': [],
      Unknown: [],
      '': [],
    }

    // Find cards that friend has 2+ copies of and are in a tradable expansion
    const friendExtraCards = friendCards.filter((card) => card.amount_owned >= 2)

    // Filter out cards that user already owns
    const userCardIds = new Set(ownedCards.filter((card) => card.amount_owned > 0).map((card) => card.card_id))
    const cardsUserDoesntOwn = friendExtraCards.filter((card) => !userCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsUserDoesntOwn) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards])

  // Cards the user has 2+ copies of that the friend doesn't own
  const userExtraCards = useMemo(() => {
    const result: Record<Rarity, TradeCard[]> = {
      '◊': [],
      '◊◊': [],
      '◊◊◊': [],
      '◊◊◊◊': [],
      '☆': [],
      '☆☆': [],
      '☆☆☆': [],
      '✵': [],
      '✵✵': [],
      'Crown Rare': [],
      Unknown: [],
      '': [],
    }

    // Find cards that user has 2+ copies of
    const userExtraCards = ownedCards.filter((card) => card.amount_owned >= 2)

    // Filter out cards that friend already owns
    const friendCardIds = new Set(friendCards.filter((card) => card.amount_owned > 0).map((card) => card.card_id))
    const cardsFriendDoesntOwn = userExtraCards.filter((card) => !friendCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsFriendDoesntOwn) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards])

  // Check if there are any possible trades across all rarities
  const hasPossibleTrades = useMemo(() => {
    return rarityOrder.some((rarity) => friendExtraCards[rarity].length > 0 && userExtraCards[rarity].length > 0)
  }, [friendExtraCards, userExtraCards])

  return (
    <Dialog
      open={isTradeMatchesDialogOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate(location.pathname.replace('/trade', ''))
        }
      }}
    >
      <DialogContent className="border-2 border-slate-600 shadow-none max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!hasPossibleTrades && (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500">{t('noPossibleTrades')}</p>
              <p className="text-sm text-gray-400 mt-2">{t('noPossibleTradesDescription')}</p>
            </div>
          )}
          {rarityOrder.map(
            (rarity) =>
              friendExtraCards[rarity].length > 0 &&
              userExtraCards[rarity].length > 0 && (
                <div key={rarity} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{rarity}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">{t('friendHas')}</h4>
                      <div className="border rounded p-2 max-h-60 overflow-y-auto">
                        <ul className="space-y-1">
                          {friendExtraCards[rarity].map((card) => (
                            <li key={card.card_id} className="flex justify-between">
                              <div className="flex items-center">
                                <div className="min-w-14 me-4">{card.card_id}</div>
                                <div>{card.name}</div>
                              </div>
                              <span className="text-gray-500">×{card.amount_owned}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium mb-2">{t('youHave')}</h4>
                      <div className="border rounded p-2 max-h-60 overflow-y-auto">
                        <ul className="space-y-1">
                          {userExtraCards[rarity].map((card) => (
                            <li key={card.card_id} className="flex justify-between">
                              <div className="flex items-center">
                                <div className="min-w-14 me-4">{card.card_id}</div>
                                <div>{card.name}</div>
                              </div>
                              <span className="text-gray-500">×{card.amount_owned}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TradeMatches
