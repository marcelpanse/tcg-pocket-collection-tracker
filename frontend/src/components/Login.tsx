import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { sendMagicLink } from '@/lib/Auth.ts'
import { useState } from 'react'
import { email, maxLength, nonEmpty, pipe, safeParse, string } from 'valibot'
import { Input } from './ui/input.tsx'

const EmailSchema = pipe(string(), nonEmpty('Email is required'), email('Email must be valid'), maxLength(255, 'Email must be less than 255 characters'))

export const Login = () => {
  const { toast } = useToast()

  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  if (emailSent) {
    return <div className="pt-4">Thank you. Check your email for a magic login link!</div>
  }

  return (
    <div className="pt-4">
      <p>
        Fill in your email address to get a magic link to login. If you don't have an account yet, we will automatically create one for you. We won't use your
        email address for anything else.
      </p>

      <div className="flex justify-center gap-2 pt-4 align-center">
        <Input type="email" placeholder="Email" onChange={(e) => setEmailInput(e.target.value)} />

        <Button
          onClick={async () => {
            const result = safeParse(EmailSchema, emailInput)
            if (!result.success) {
              toast({ title: 'Please enter a valid email address' })
              return
            }

            setEmailSent(true)
            await sendMagicLink(emailInput)
          }}
        >
          login / signup
        </Button>
      </div>
    </div>
  )
}
