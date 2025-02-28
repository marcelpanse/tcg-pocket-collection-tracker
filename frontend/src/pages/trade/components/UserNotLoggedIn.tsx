import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'

export function UserNotLoggedIn() {
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-2 border-slate-600 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>Sign up to view your tradeable cards</AlertTitle>
        <AlertDescription>By registering, you can keep track of your collection, trade with other users, and access exclusive features.</AlertDescription>
      </Alert>
    </article>
  )
}
