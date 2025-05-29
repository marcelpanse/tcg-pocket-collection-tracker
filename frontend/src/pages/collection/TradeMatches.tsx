import { SocialShareButtons } from '@/components/SocialShareButtons.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/Auth.ts'
import { expansions, getCardById } from '@/lib/CardsDB'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { AccountRow, Card, CollectionRow, Rarity } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import { type FC, useContext, useEffect, useState } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'

interface Props {
  ownedCards: CollectionRow[]
  friendCards: CollectionRow[]
  ownCollection: boolean
  friendAccount: AccountRow | null
}

// Order of rarities for display
const rarityOrder: Rarity[] = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆']

interface TradeCard extends Card {
  amount_owned: number
}

const TradeMatches: FC<Props> = ({ ownedCards, friendCards, ownCollection, friendAccount }) => {
  const { t } = useTranslation('trade-matches')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, account, setAccount } = useContext(UserContext)

  const [isTradeMatchesDialogOpen, setIsTradeMatchesDialogOpen] = useState(false)
  const [userCardsMinFilter, setUserCardsMinFilter] = useState<number>(0)
  const [friendCardsMinFilter, setFriendCardsMinFilter] = useState<number>(2)

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
      P: [],
      '': [],
    }

    const friendExtraCards = friendCards.filter((card) => card.amount_owned >= (friendAccount?.min_number_of_cards_to_keep || 1) + 1)
    const userCardIds = new Set(ownedCards.filter((card) => card.amount_owned > userCardsMinFilter).map((card) => card.card_id))
    const cardsUserNeeds = friendExtraCards.filter((card) => !userCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsUserNeeds) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards, userCardsMinFilter, friendCardsMinFilter])

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
      P: [],
      '': [],
    }

    const userExtraCards = ownedCards.filter((card) => card.amount_owned >= friendCardsMinFilter)
    const friendCardIds = new Set(friendCards.filter((card) => card.amount_owned > 0).map((card) => card.card_id))
    const cardsFriendNeeds = userExtraCards.filter((card) => !friendCardIds.has(card.card_id))

    // Get full card info and group by rarity
    for (const card of cardsFriendNeeds) {
      const fullCard = getCardById(card.card_id)
      if (fullCard && rarityOrder.includes(fullCard.rarity) && tradeableExpansions.includes(fullCard.expansion)) {
        result[fullCard.rarity].push({
          ...fullCard,
          amount_owned: card.amount_owned,
        })
      }
    }

    return result
  }, [ownedCards, friendCards, userCardsMinFilter, friendCardsMinFilter])

  // Check if there are any possible trades across all rarities
  const hasPossibleTrades = useMemo(() => {
    return rarityOrder.some((rarity) => friendExtraCards[rarity].length > 0 && userExtraCards[rarity].length > 0)
  }, [friendExtraCards, userExtraCards])

  const formSchema = z.object({
    is_active_trading: z.boolean(),
    min_number_of_cards_to_keep: z.coerce.number().min(1).max(10),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      is_active_trading: account?.is_active_trading || false,
      min_number_of_cards_to_keep: account?.min_number_of_cards_to_keep || 1,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const updatedAccount = await supabase
        .from('accounts')
        .upsert({
          email: user?.user.email,
          username: account?.username,
          is_active_trading: values.is_active_trading,
          min_number_of_cards_to_keep: values.min_number_of_cards_to_keep,
        })
        .select()
        .single()

      if (!updatedAccount.data) {
        console.error('Could not save account', account)
        throw new Error('Could not save account')
      }
      setAccount(updatedAccount.data as AccountRow)

      toast({ title: 'Account saved.', variant: 'default' })
    } catch (e) {
      console.error('error saving account', e)
      toast({ title: 'Error saving your account.', variant: 'destructive' })
    }
  }

  const tradeMatchesContent = () => {
    if (ownCollection) {
      return (
        <div className="text-center py-8">
          <p className="text-xl ">{t('ownCollection')}</p>
          <p className="text-sm text-gray-300 mt-2">{t('ownCollectionDescription')}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex justify-center">
              <div className="border-1 border-neutral-700 p-4 space-y-2">
                <FormField
                  control={form.control}
                  name="is_active_trading"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormControl>
                        <div className="flex items-center gap-x-4 flex-wrap">
                          <FormLabel className="flex sm:w-72">{t('isActiveTrading')}</FormLabel>
                          <div className="grow-1">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                          <FormDescription className="grow">{field.value ? 'active' : 'disabled'}</FormDescription>
                          <Tooltip id="activeInput" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                          <CircleHelp className="h-4 w-4" data-tooltip-id="activeInput" data-tooltip-content={t('activeTradingInputTooltip')} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_number_of_cards_to_keep"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormControl>
                        <div className="flex items-center gap-x-4 flex-wrap">
                          <FormLabel className="flex sm:w-72">{t('minNumberOfCardsToKeep')}</FormLabel>
                          <div className="grow-1">
                            <Input type="number" {...field} />
                          </div>
                          <Tooltip id="minInput" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                          <CircleHelp className="h-4 w-4" data-tooltip-id="minInput" data-tooltip-content={t('minInputTooltip')} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="w-full flex justify-end mt-8">
                  <Button type="submit">{t('save')}</Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      )
    }

    if (!friendAccount?.is_active_trading) {
      return (
        <div className="text-center py-8">
          <p className="text-xl ">{t('inActiveTradePage', { username: friendAccount?.username })}</p>
          <p className="text-sm text-gray-300 mt-2">{t('inActiveTradeDescription')}</p>
        </div>
      )
    }

    if (!hasPossibleTrades) {
      return (
        <div className="text-center py-8">
          <p className="text-xl ">{t('noPossibleTrades')}</p>
          <p className="text-sm text-gray-300 mt-2">{t('noPossibleTradesDescription')}</p>
        </div>
      )
    }

    return rarityOrder.map(
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
                        <span title="Amount you own" className="text-gray-500">
                          ×{ownedCards.find((c) => c.card_id === card.card_id)?.amount_owned || 0}
                        </span>
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
                        <span title="Amount your friend owns" className="text-gray-500">
                          ×{card.amount_owned}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
    )
  }

  return (
    <Dialog
      open={isTradeMatchesDialogOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate(location.pathname.replace('/trade', ''))
        }
      }}
    >
      <DialogContent className="border-1 border-neutral-700 shadow-none max-w-4xl h-[90vh] content-start flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 grow">
          <p className="pb-2">{t('featureDescription')}</p>
          <p className="pb-2">{t('friendAccountDetails', { ...friendAccount })}</p>

          {!ownCollection && (
            <div className="flex flex-row gap-4 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <NumberFilter numberFilter={userCardsMinFilter} setNumberFilter={setUserCardsMinFilter} options={[0, 1, 2, 3, 4, 5]} labelKey="maxNum" />
                <Tooltip id="minFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                <CircleHelp className="h-4 w-4" data-tooltip-id="minFilter" data-tooltip-content={t('minFilterTooltip')} />
              </div>
              <div className="flex items-center gap-2">
                <Tooltip id="maxFilter" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                <CircleHelp className="h-4 w-4" data-tooltip-id="maxFilter" data-tooltip-content={t('maxFilterTooltip')} />
                <NumberFilter numberFilter={friendCardsMinFilter} setNumberFilter={setFriendCardsMinFilter} options={[2, 3, 4, 5]} labelKey="minNum" />
              </div>
            </div>
          )}

          {tradeMatchesContent()}
        </div>
        {ownCollection && (
          <DialogFooter>
            <SocialShareButtons />
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TradeMatches
