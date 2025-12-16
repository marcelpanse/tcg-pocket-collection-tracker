import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Alert } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/hooks/use-toast.ts'
import { useAccount, useUpdateAccountTradingFields } from '@/services/account/useAccount.ts'
import { rarities } from '@/types/index.ts'

function TradeSettings() {
  const { t } = useTranslation('trade-matches')

  const { data: account } = useAccount()
  const updateAccountTradingFieldsMutation = useUpdateAccountTradingFields()

  const formSchema = z.object({
    is_active_trading: z.boolean(),
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
      is_active_trading: account?.is_active_trading || false,
      trade_rarity_settings: account?.trade_rarity_settings || [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    updateAccountTradingFieldsMutation.mutate(
      {
        username: account?.username as string,
        is_active_trading: values.is_active_trading,
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

  if (!account || !account.username) {
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
                    <Switch className="ml-2" checked={field.value} onCheckedChange={field.onChange} />
                  </FormLabel>
                </FormControl>
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

          <Button type="submit" className="block ml-auto mt-4" disabled={updateAccountTradingFieldsMutation.isPending}>
            {t('save')}
            {updateAccountTradingFieldsMutation.isPending && (
              <div className="ml-2 inline-block animate-spin rounded-full size-4 border-2 border-black border-t-transparent" />
            )}
          </Button>
        </form>
      </Form>
      <SocialShareButtons className="mt-4 mx-auto w-fit" />
    </div>
  )
}

export default TradeSettings
