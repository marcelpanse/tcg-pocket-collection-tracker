import { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { signInWithOtp, useLoginDialog, useVerifyOTP } from '@/services/auth/useAuth'
import { Input } from './ui/input.tsx'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp.tsx'

export const Login: FC = () => {
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { toast } = useToast()
  const { t } = useTranslation('login')
  const verifyOtpMutation = useVerifyOTP()

  const EmailSchema = z.email(t('emailInvalid')).nonempty(t('emailRequired')).max(255, t('emailTooLong'))

  const [emailInput, setEmailInput] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [emailSubmitting, setEmailSubmitting] = useState(false)

  const otpEntered = async (otp: string) => {
    try {
      verifyOtpMutation.mutate({ email: emailInput, otp })
      setIsLoginDialogOpen(false)
    } catch (e) {
      console.error('error verifying otp', e)
      toast({ title: t('otpVerifyError'), variant: 'destructive' })
    }
  }

  const submitEmail = async () => {
    const result = EmailSchema.safeParse(emailInput)
    if (!result.success) {
      toast({ title: t('validEmail'), variant: 'destructive' })
      return
    }

    setEmailSubmitting(true)

    try {
      await signInWithOtp({ email: emailInput })
      setEmailSubmitted(true)
    } catch {
      toast({ title: t('otpSendError'), variant: 'destructive' })
      setEmailSubmitting(false)
    }
  }

  if (emailSubmitted) {
    return (
      <>
        <p className="pt-4">{t('fill6Digit')}</p>
        <div>
          <InputOTP maxLength={6} autoFocus onComplete={otpEntered} className="max-w-max">
            <InputOTPGroup className="border-1 border-neutral-700 shadow-none">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="border-1 border-neutral-700 shadow-none">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </>
    )
  }

  return (
    <div className="pt-4">
      <p>{t('fillEmail')}</p>

      <div className="flex justify-center gap-2 pt-4 align-center">
        <Input
          disabled={emailSubmitting}
          type="email"
          placeholder={t('email')}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await submitEmail()
            }
          }}
        />

        <Button onClick={submitEmail} disabled={emailSubmitting}>
          {t('button')}
        </Button>
      </div>

      <p className="mt-3 text-sm text-white/25">{t('onlyEmail')}</p>
    </div>
  )
}
