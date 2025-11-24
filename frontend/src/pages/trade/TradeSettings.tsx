import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { z } from 'zod'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Alert } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
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
    try {
      updateAccountTradingFieldsMutation.mutate({
        username: account?.username as string,
        is_active_trading: values.is_active_trading,
        trade_rarity_settings: values.trade_rarity_settings,
      })

      toast({ title: t('accountSaved'), variant: 'default' })
    } catch (e) {
      console.error('error saving account', e)
      toast({ title: t('errorSavingAccount'), variant: 'destructive' })
    }
  }

  if (!account || !account.username) {
    return <Alert className="mb-8 border-1 border-neutral-700 shadow-none">{t('noAccount')}</Alert>
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="border-1 border-neutral-700 space-y-2 p-4 mx-auto">
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

          <div className="mt-6">
            <div className="flex items-center gap-x-4 mb-2">
              <div className="flex-1">{t('rarity')}</div>
              <div className="flex-1">{t('toCollect')}</div>
              <div className="flex-1">{t('toKeep')}</div>
            </div>
            {form.watch('trade_rarity_settings').map((setting, index) => (
              <div key={index} className="flex items-center gap-x-4 mb-2">
                <div className="flex-1">{setting.rarity}</div>
                <FormField
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
              </div>
            ))}
          </div>

          <div className="w-full flex justify-end mt-8">
            <Button type="submit">{t('save')}</Button>
          </div>
        </form>
      </Form>
      <SocialShareButtons className="mt-4" />
    </div>
  )
}

export default TradeSettings
