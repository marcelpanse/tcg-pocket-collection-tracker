import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'

export function NoTradeableCards() {
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-2 border-slate-600 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>You have no tradeable cards!</AlertTitle>
        <AlertDescription>Go to the collections page and input your collected cards to see what you can trade.</AlertDescription>
      </Alert>
    </article>
  )
}
