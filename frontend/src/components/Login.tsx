import { Button } from '@/components/ui/button.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { useState } from 'react'
import { sendMagicLink } from '../lib/Auth.ts'
import { Input } from './ui/input.tsx'

export const Login = () => {
  const { toast } = useToast()

  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  return (
    <>
      {!emailSent && (
        <div className="pt-4">
          Fill in your email address to get a magic link to login. If you don't have an account yet, we will automatically create one for you.
          <div className="flex align-center justify-center gap-2 pt-4">
            <Input type="email" placeholder="Email" onChange={(e) => setEmailInput(e.target.value)} />

            <Button
              onClick={async () => {
                if (emailInput) {
                  // TODO: validate email with regex
                  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  if (!regex.test(emailInput)) {
                    toast({
                      title: 'Please enter a valid email address',
                    })
                    return
                  }

                  setEmailSent(true)
                  await sendMagicLink(emailInput)
                } else {
                  toast({
                    title: 'Please enter an email address',
                  })
                }
              }}
            >
              login / signup
            </Button>
          </div>
        </div>
      )}
      {emailSent && <div className="pt-4">Thank you. Check your email for a magic login link!</div>}
    </>
  )
}
