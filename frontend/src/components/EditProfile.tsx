import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast.ts'
import { ACCOUNTS_ID, DATABASE_ID, getDatabase } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import type { AccountRow } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ID } from 'appwrite'
import { Siren } from 'lucide-react'
import { type FC, use } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface Props {
  account: AccountRow | null
  setAccount: (account: AccountRow | null) => void
  isProfileDialogOpen: boolean
  setIsProfileDialogOpen: (isProfileDialogOpen: boolean) => void
}
const EditProfile: FC<Props> = ({ account, setAccount, isProfileDialogOpen, setIsProfileDialogOpen }) => {
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
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: account?.username || '',
      friend_id: account?.friend_id || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const db = await getDatabase()

    try {
      if (!account) {
        // create new account object
        console.log('creating new account', values)
        const newAccount = await db.createDocument(DATABASE_ID, ACCOUNTS_ID, ID.unique(), {
          email: user?.email,
          username: values.username,
          friend_id: values.friend_id,
        })
        setAccount(newAccount as unknown as AccountRow)
      } else {
        // update existing account object
        console.log('updating account', values)
        await db.updateDocument(DATABASE_ID, ACCOUNTS_ID, account.$id, {
          username: values.username,
          friend_id: values.friend_id,
        })

        account.username = values.username
        account.friend_id = values.friend_id
        setAccount(account)
      }
      toast({ title: 'Account saved.', variant: 'default' })
      setIsProfileDialogOpen(false)
    } catch (e) {
      console.error('error saving account', e)
      toast({ title: 'Error saving your account.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
      <DialogContent className="border-2 border-slate-600 shadow-none">
        <DialogHeader>
          <DialogTitle>{t('editProfile')}</DialogTitle>
        </DialogHeader>

        <Alert className="mb-2 border-2 border-slate-600 shadow-none">
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
                    <Input placeholder="Email" disabled value={user?.email} />
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
            <Button type="submit">{t('save')}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfile
