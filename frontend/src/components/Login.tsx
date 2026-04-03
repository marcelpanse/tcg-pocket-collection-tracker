import { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { useLogin, useLoginDialog, useRegister } from '@/services/auth/useAuth'
import { Input } from './ui/input.tsx'

export const Login: FC = () => {
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { toast } = useToast()
  const { t } = useTranslation('login')
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const EmailSchema = z.email(t('emailInvalid')).nonempty(t('emailRequired')).max(255, t('emailTooLong'))

  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const isSubmitting = loginMutation.isPending || registerMutation.isPending

  const handleSubmit = async () => {
    const result = EmailSchema.safeParse(emailInput)
    if (!result.success) {
      toast({ title: t('validEmail'), variant: 'destructive' })
      return
    }

    if (!passwordInput) {
      toast({ title: t('passwordRequired'), variant: 'destructive' })
      return
    }

    if (isRegisterMode && passwordInput !== confirmPasswordInput) {
      toast({ title: t('passwordMismatch'), variant: 'destructive' })
      return
    }

    try {
      if (isRegisterMode) {
        await registerMutation.mutateAsync({ email: emailInput, password: passwordInput })
        await loginMutation.mutateAsync({ email: emailInput, password: passwordInput })
      } else {
        await loginMutation.mutateAsync({ email: emailInput, password: passwordInput })
      }
      setIsLoginDialogOpen(false)
    } catch {
      toast({
        title: isRegisterMode ? t('registerError') : t('loginError'),
        variant: 'destructive',
      })
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSubmit()
    }
  }

  return (
    <div className="pt-4">
      <p>{t('fillEmail')}</p>

      <div className="flex flex-col gap-2 pt-4">
        <Input
          disabled={isSubmitting}
          type="email"
          placeholder={t('email')}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Input
          disabled={isSubmitting}
          type="password"
          placeholder={t('password')}
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {isRegisterMode && (
          <Input
            disabled={isSubmitting}
            type="password"
            placeholder={t('confirmPassword')}
            value={confirmPasswordInput}
            onChange={(e) => setConfirmPasswordInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isRegisterMode ? t('register') : t('button')}
        </Button>

        <button type="button" className="mt-1 text-sm text-white/50 underline hover:text-white/75" onClick={() => setIsRegisterMode(!isRegisterMode)}>
          {isRegisterMode ? t('haveAccount') : t('noAccount')}
        </button>
      </div>
    </div>
  )
}
