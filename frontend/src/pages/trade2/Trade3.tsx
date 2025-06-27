import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/Auth.ts'
import { allCardsDict } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { AccountRow, CollectionRow, TradeRow } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import CardList from './CardList'

function groupTrades(arr: TradeRow[], id: string) {
  return Object.groupBy(arr, (row) => {
    if (row.from === id) return row.to
    if (row.to === id) return row.from
    return 'undefined'
  })
}

interface TradePartnerProps {
  friend_id: string
  trades: TradeRow[]
  account: AccountRow
  ownedCards: CollectionRow[]
}

function TradePartner({ friend_id, trades, account, ownedCards }: TradePartnerProps) {
  const { t } = useTranslation('trade-matches')
  const [tradeProposition1, setTradeProposition1] = useState<string[]>([])
  const [tradeProposition2, setTradeProposition2] = useState<string[]>([])
  const propositionLength = tradeProposition1.length + tradeProposition2.length

  function removeTrades() {
    alert(`Removing ${propositionLength} trades`)
  }

  return (
    <div key={friend_id}>
      <p>Trading with {friend_id}</p>
      <Button type="button" onClick={removeTrades} disabled={propositionLength === 0}>
        Remove {propositionLength} propositions
      </Button>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-md font-medium mb-2">{t('friendHas')}</h4>
          <CardList
            cards={trades
              .filter((row: TradeRow) => row.from === account.friend_id)
              .map((row) => allCardsDict.get(row.card_id))
              .filter((c) => !!c)}
            ownedCards={ownedCards}
            tradeProposition={tradeProposition1}
            setTradeProposition={setTradeProposition1}
            selectionColor="red"
          />
        </div>
        <div>
          <h4 className="text-md font-medium mb-2">{t('youHave')}</h4>
          <CardList
            cards={trades
              .filter((row: TradeRow) => row.to === account.friend_id)
              .map((row) => allCardsDict.get(row.card_id))
              .filter((c) => !!c)}
            ownedCards={ownedCards}
            tradeProposition={tradeProposition2}
            setTradeProposition={setTradeProposition2}
            selectionColor="red"
          />
        </div>
      </div>
    </div>
  )
}

function TradePropositions() {
  const { t } = useTranslation('trade-matches')

  const { user, account, setAccount } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)

  const [trades, setTrades] = useState<TradeRow[] | null>(null)

  useEffect(() => {
    if (account && trades === null) {
      setTrades([
        { from: account.friend_id, to: '123', card_id: 'A1-1' },
        { from: account.friend_id, to: '123', card_id: 'A1-2' },
        { from: '123', to: account.friend_id, card_id: 'A1-3' },
        { from: account.friend_id, to: '456', card_id: 'A1-11' },
        { from: '456', to: account.friend_id, card_id: 'A1-12' },
        { from: '456', to: account.friend_id, card_id: 'A1-13' },
        { from: '789', to: account.friend_id, card_id: 'A1-21' },
      ])
    }
  })

  const formSchema = z.object({
    is_active_trading: z.boolean(),
    min_number_of_cards_to_keep: z.coerce.number().min(1).max(10),
    max_number_of_cards_wanted: z.coerce.number().min(1).max(10),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      is_active_trading: account?.is_active_trading || false,
      min_number_of_cards_to_keep: account?.min_number_of_cards_to_keep || 1,
      max_number_of_cards_wanted: account?.max_number_of_cards_wanted || 1,
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
          max_number_of_cards_wanted: values.max_number_of_cards_wanted,
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

  const tradeSettings = () => {
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

              <FormField
                control={form.control}
                name="max_number_of_cards_wanted"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormControl>
                      <div className="flex items-center gap-x-4 flex-wrap">
                        <FormLabel className="flex sm:w-72">{t('maxNumberOfCardsWanted')}</FormLabel>
                        <div className="grow-1">
                          <Input type="number" {...field} />
                        </div>
                        <Tooltip id="maxInput" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                        <CircleHelp className="h-4 w-4" data-tooltip-id="maxInput" data-tooltip-content={t('maxInputTooltip')} />
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

  if (trades === null || !account) return <div>Loading: {JSON.stringify(account)}</div>

  const friends = groupTrades(trades, account.friend_id)

  return (
    <div>
      {tradeSettings()}
      <div>
        {Object.keys(friends).map((friend_id) => (
          <TradePartner key={friend_id} friend_id={friend_id} trades={friends[friend_id]} account={account} ownedCards={ownedCards} />
        ))}
      </div>
    </div>
  )
}

export default TradePropositions
