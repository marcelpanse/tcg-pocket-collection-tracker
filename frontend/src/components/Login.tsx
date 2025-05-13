import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { supabase } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp.tsx'
import { Input } from './ui/input.tsx'

const EmailSchema = z.string().nonempty('Email is required').email('Email must be valid').max(255, 'Email must be less than 255 characters')

export const Login = () => {
  const { setIsLoginDialogOpen } = use(UserContext)
  const { toast } = useToast()
  const { t } = useTranslation('login')

  const [emailInput, setEmailInput] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const otpEntered = async (otp: string) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email: emailInput,
        token: otp,
        type: 'email',
      })

      if (error) {
        console.log('supa OTP error', error)
        toast({ title: 'There was an error verifying your OTP. Please try again.', variant: 'destructive' })
      } else {
        console.log('supa session', session)
        setIsLoginDialogOpen(false)
      }
    } catch {
      toast({ title: t('invalidCode'), variant: 'destructive' })
    }
  }

  const submitEmail = async () => {
    const result = EmailSchema.safeParse(emailInput)
    if (!result.success) {
      toast({ title: t('validEmail'), variant: 'destructive' })
      return
    }

    const { error } = await supabase.auth.signInWithOtp({ email: emailInput })
    if (error) {
      console.log('supa OTP error', error)
      toast({ title: 'There was an error sending your OTP email. Please try again.', variant: 'destructive' })
    } else {
      setEmailSubmitted(true)
    }
  }

  if (emailSubmitted) {
    return (
      <>
        <p className="pt-4">{t('fill6Digit')}</p>
        <div>
          <InputOTP maxLength={6} autoFocus onComplete={otpEntered} className="max-w-max">
            <InputOTPGroup className="border-2 border-slate-600 shadow-none">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="border-2 border-slate-600 shadow-none">
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
          type="email"
          placeholder="Email"
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await submitEmail()
            }
          }}
        />

        <Button onClick={submitEmail}>{t('button')}</Button>
      </div>

      <p className="mt-3 text-sm text-white/25">We'll only use your email for login.</p>
    </div>
  )
}
