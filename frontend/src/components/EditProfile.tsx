import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { AccountRow } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Siren } from 'lucide-react'
import { type FC, use } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { SocialShareButtons } from './SocialShareButtons'

interface Props {
  account: AccountRow | null
  setAccount: (account: AccountRow | null) => void
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isProfileDialogOpen: boolean) => void
}
const EditProfile: FC<Props> = ({ account, setAccount, isProfileDialogOpen, setIsProfileDialogOpen }) => {
  const navigate = useNavigate()
  const { user } = use(UserContext)
  const { toast } = useToast()
  const { t } = useTranslation('edit-profile')

  const formSchema = z.object({
    username: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    friend_id: z.string().regex(/^[0-9]{16}$/, {
      message: 'Friend ID is not valid, it must be 16 digits without dashes.',
    }),
    is_public: z.boolean().optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: account?.username || '',
      friend_id: account?.friend_id || '',
      is_public: account?.is_public || false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const account = await supabase
        .from('accounts')
        .upsert({
          email: user?.user.email,
          username: values.username,
          friend_id: values.friend_id,
          is_public: values.is_public,
        })
        .select()
        .single()

      setAccount(account.data as AccountRow)

      toast({ title: 'Account saved.', variant: 'default' })
    } catch (e) {
      console.error('error saving account', e)
      toast({ title: 'Error saving your account.', variant: 'destructive' })
    }
  }

  const shareUrl = `https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}`

  return (
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
      <DialogContent className="border-1 border-neutral-700 shadow-none h-[90vh] content-start">
        <DialogHeader>
          <DialogTitle>{t('editProfile')}</DialogTitle>
        </DialogHeader>

        <Alert className="mb-2 border-1 border-neutral-700 shadow-none">
          <Siren className="h-4 w-4" />
          <AlertTitle>{t('updateProfile.title')}</AlertTitle>
          <AlertDescription>{t('updateProfile.description')}</AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl className="mt-2">
                    <Input placeholder="Email" disabled value={user?.user.email} />
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
                  <FormControl className="mt-2">
                    <Input placeholder="Username" {...field} />
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
                  <FormControl className="mt-2">
                    <Input placeholder="Friend ID" {...field} />
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
                    <div className="flex items-center gap-x-2 w-full flex-wrap">
                      <FormLabel>{t('isPublicToggle')}</FormLabel>
                      <div className="grow-1">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                      <Button
                        disabled={!account?.is_public}
                        onClick={async (e) => {
                          e.preventDefault()

                          toast({ title: 'Copied public collection page URL to clipboard!', variant: 'default', duration: 3000 })
                          await navigator.clipboard.writeText(shareUrl)
                        }}
                      >
                        {t('isPublicButton')}
                      </Button>
                      <Button
                        disabled={!account?.is_public}
                        onClick={async (e) => {
                          e.preventDefault()

                          setIsProfileDialogOpen(false)
                          navigate(`/collection/${account?.friend_id}/trade`)
                        }}
                      >
                        {t('isPublicTradeButton')}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>{t('isPublicDescription')}</FormDescription>
                </FormItem>
              )}
            />
            {account?.is_public && <SocialShareButtons />}
            <Button type="submit">{t('save')}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfile
