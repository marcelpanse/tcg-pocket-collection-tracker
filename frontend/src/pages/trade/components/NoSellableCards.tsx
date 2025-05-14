import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'

export function NoSellableCards() {
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>You have no sellable cards!</AlertTitle>
        <AlertDescription>
          If you believe you have sellable cards, go to the collections page and input your collected cards to see what you can sell.
        </AlertDescription>
      </Alert>
    </article>
  )
}
