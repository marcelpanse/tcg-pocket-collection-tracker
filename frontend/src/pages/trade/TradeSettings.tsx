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

function TradeSettings() {
  const { t } = useTranslation('trade-matches')

  const { data: account } = useAccount()
  const updateAccountTradingFieldsMutation = useUpdateAccountTradingFields()

  const formSchema = z.object({
    is_active_trading: z.boolean(),
    min_number_of_cards_to_keep: z.coerce.number().min(1).max(10),
    max_number_of_cards_wanted: z.coerce.number().min(1).max(10),
  })
  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
    values: {
      is_active_trading: account?.is_active_trading || false,
      min_number_of_cards_to_keep: account?.min_number_of_cards_to_keep || 1,
      max_number_of_cards_wanted: account?.max_number_of_cards_wanted || 1,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      updateAccountTradingFieldsMutation.mutate({
        username: account?.username as string,
        is_active_trading: values.is_active_trading,
        min_number_of_cards_to_keep: values.min_number_of_cards_to_keep,
        max_number_of_cards_wanted: values.max_number_of_cards_wanted,
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

          <FormField
            control={form.control}
            name="min_number_of_cards_to_keep"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormControl>
                  <div className="flex items-center gap-x-4 flex-wrap">
                    <FormLabel className="flex sm:w-72">{t('minNumberOfCardsToKeep')}</FormLabel>
                    <div className="grow-1">
                      <Input className="w-24" type="number" {...field} />
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
                      <Input className="w-24" type="number" {...field} />
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
        </form>
      </Form>
      <SocialShareButtons className="mt-4" />
    </div>
  )
}

export default TradeSettings
