import { zodResolver } from '@hookform/resolvers/zod'
import { Siren } from 'lucide-react'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { useAccount, useProfileDialog, useUpdateAccount } from '@/services/account/useAccount'
import { useUser } from '@/services/auth/useAuth'
import type { AccountRow } from '@/types'
import { SocialShareButtons } from './SocialShareButtons'

const EditProfile: FC = () => {
  const navigate = useNavigate()
  const { data: user } = useUser()
  const { data: account } = useAccount()
  const updateAccountMutation = useUpdateAccount()
  const { isProfileDialogOpen, setIsProfileDialogOpen } = useProfileDialog()
  const { toast } = useToast()
  const { t } = useTranslation('edit-profile')

  const formSchema = z.object({
    username: z.string().min(2, { message: t('usernameTooShort') }),
    friend_id: z.string().regex(/^\d{16}$/, { message: t('friendIdInvalid') }),
    is_public: z.boolean().optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: account?.username ?? '',
      friend_id: account?.friend_id ?? '',
      is_public: account?.is_public ?? false,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAccountMutation.mutate(
      {
        email: user?.user.email as string,
        username: values.username,
        friend_id: values.friend_id,
        is_public: values.is_public,
      } as AccountRow,
      {
        onSuccess: () => toast({ title: t('accountSaved'), variant: 'default' }),
        onError: (e) => {
          console.error('error saving account', e)
          toast({ title: t('accountSavingError'), variant: 'destructive' })
        },
      },
    )
  }

  return (
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
      <DialogContent className="border-1 border-neutral-700">
        <DialogHeader>
          <DialogTitle>{t('editProfile')}</DialogTitle>
        </DialogHeader>

        <Alert className="mb-2">
          <Siren className="size-4" />
          <AlertTitle>{t('updateProfile.title')}</AlertTitle>
          <AlertDescription>{t('updateProfile.description')}</AlertDescription>
        </Alert>

        <Button
          onClick={(e) => {
            e.preventDefault()
            setIsProfileDialogOpen(false)
            navigate(`/trade/settings`)
          }}
        >
          {t('openTradingSettings')}
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl className="mt-1">
                    <Input placeholder={t('email')} disabled value={user?.user.email} />
                  </FormControl>
                  <FormDescription>{t('registeredEmail')}</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('username')}</FormLabel>
                  <FormControl className="mt-1">
                    <Input placeholder={t('username')} {...field} />
                  </FormControl>
                  <FormDescription>{t('usernameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="friend_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('friendID')}</FormLabel>
                  <FormControl className="mt-1">
                    <Input placeholder={t('friendID')} {...field} />
                  </FormControl>
                  <FormDescription>{t('friendIDDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormControl className="mt-2">
                    <FormLabel className="flex items-center">
                      {t('isPublicToggle')}
                      <Switch className="ml-2" checked={field.value} onCheckedChange={field.onChange} />
                    </FormLabel>
                  </FormControl>
                  <FormDescription>{t('isPublicDescription')}</FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="block ml-auto" disabled={updateAccountMutation.isPending} isPending={updateAccountMutation.isPending}>
              {t('save')}
            </Button>
          </form>
        </Form>
        {account?.is_public && <SocialShareButtons className="mt-4" />}
      </DialogContent>
    </Dialog>
  )
}

export default EditProfile
