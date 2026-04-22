import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { CardLine } from '@/components/CardLine'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Alert } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/hooks/use-toast.ts'
import { getCardByInternalId } from '@/lib/CardsDB'
import { formatLanguage } from '@/lib/utils'
import { useAccount, useUpdateAccountTradingFields } from '@/services/account/useAccount.ts'
import { useCollection } from '@/services/collection/useCollection'
import { gameLanguages, rarities } from '@/types/index.ts'

function TradeSettings() {
  const { t } = useTranslation('trade-matches')

  const { data: account } = useAccount()
  const updateAccountTradingFieldsMutation = useUpdateAccountTradingFields()

  const { data: ownedCards } = useCollection()
  const overridenCards = ownedCards !== undefined ? [...ownedCards.values()].filter((row) => row.amount_wanted !== null) : []

  const formSchema = z.object({
    is_active_trading: z.boolean(),
    language: z.enum([...gameLanguages, '']),
    trade_rarity_settings: z.array(
      z.object({
        rarity: z.enum(rarities),
        to_collect: z.coerce.number().min(0).max(100),
        to_keep: z.coerce.number().min(0).max(100),
      }),
    ),
  })
  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
    values: {
      is_active_trading: account?.is_active_trading ?? false,
      language: account?.language ?? '',
      trade_rarity_settings: account?.trade_rarity_settings ?? [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    updateAccountTradingFieldsMutation.mutate(
      {
        username: account?.username as string,
        is_active_trading: values.is_active_trading,
        language: values.language === '' ? null : values.language,
        trade_rarity_settings: values.trade_rarity_settings,
      },
      {
        onSuccess: () => toast({ title: t('accountSaved'), variant: 'default' }),
        onError: (e) => {
          console.error('error saving account', e)
          toast({ title: t('errorSavingAccount'), variant: 'destructive' })
        },
      },
    )
  }

  if (!account?.username) {
    return <Alert className="mb-8 border-1 border-neutral-700 shadow-none">{t('noAccount')}</Alert>
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-md border-1 border-neutral-700 space-y-2 p-4 mx-auto max-w-xl">
          <h2 className="text-xl text-center mb-6">{t('settingsTitle')}</h2>
          <FormField
            control={form.control}
            name="is_active_trading"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormControl>
                  <FormLabel className="flex">
                    {t('isActiveTrading')}
                    <Switch
                      className="ml-2"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!account?.is_public}
                      data-tooltip-id="is-active-trading-disabled"
                      data-tooltip-content={!account?.is_public ? t('isActiveTradingDisabledTooltip') : undefined}
                    />
                    {!account?.is_public && (
                      <>
                        <Tooltip id="is-active-trading-disabled" />
                        <CircleHelp
                          className="size-4 ml-1"
                          data-tooltip-id="is-active-trading-disabled"
                          data-tooltip-content={t('isActiveTradingDisabledTooltip')}
                        />
                      </>
                    )}
                  </FormLabel>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Card language
                  <Tooltip id="is-active-trading-disabled" />
                  <CircleHelp
                    className="inline size-4 ml-1"
                    data-tooltip-id="is-active-trading-disabled"
                    data-tooltip-content="Indicates that you want to only trade cards in this language."
                  />
                  <FormControl className="ml-2">
                    <span className="rounded-md border-1 border-neutral-800 px-3 py-1">
                      <select {...field}>
                        <option value="">Any language</option>
                        {gameLanguages.map((code) => (
                          <option key={code} value={code}>
                            {formatLanguage[code]}
                          </option>
                        ))}
                      </select>
                    </span>
                  </FormControl>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-y-2 gap-x-8 w-fit mt-6">
            <span>{t('rarity')}</span>
            <span className="flex items-center">
              {t('toCollect')}
              <Tooltip id="to-collect" />
              <CircleHelp className="size-4 ml-1" data-tooltip-id="to-collect" data-tooltip-content={t('toCollectTooltip')} />
            </span>
            <span className="flex items-center">
              {t('toKeep')}
              <Tooltip id="to-collect" />
              <CircleHelp className="size-4 ml-1" data-tooltip-id="to-collect" data-tooltip-content={t('toKeepTooltip')} />
            </span>
            {form.watch('trade_rarity_settings').map((setting, index) => (
              <>
                <div key={`label-${setting.rarity}`} className="flex-1">
                  {setting.rarity}
                </div>
                <FormField
                  key={`to-collect-${setting.rarity}`}
                  control={form.control}
                  name={`trade_rarity_settings.${index}.to_collect`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input className="w-24" type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  key={`to-keep-${setting.rarity}`}
                  control={form.control}
                  name={`trade_rarity_settings.${index}.to_keep`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input className="w-24" type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ))}
          </div>

          <Button
            type="submit"
            className="block ml-auto flex gap-2"
            disabled={updateAccountTradingFieldsMutation.isPending}
            isPending={updateAccountTradingFieldsMutation.isPending}
          >
            {t('save')}
          </Button>
        </form>
      </Form>
      <SocialShareButtons className="mt-4 mx-auto w-fit" />
      <div className="rounded-md border-1 border-neutral-700 space-y-2 p-4 mx-auto max-w-xl mt-4">
        <h2 className="text-xl text-center">Wanted card amounts</h2>
        <p className="text-neutral-400">The cards below have custom amount wanted and are not affected by rarity settings.</p>
        {overridenCards.length === 0 && <p className="text-neutral-400">You do not have any custom wanted card amounts.</p>}
        {overridenCards.map((row) => (
          <CardLine
            key={row.internal_id}
            card_id={getCardByInternalId(row.internal_id)?.card_id ?? ''}
            increment={(row.amount_wanted ?? 0) - row.amount_owned}
          />
        ))}
      </div>
    </div>
  )
}

export default TradeSettings
