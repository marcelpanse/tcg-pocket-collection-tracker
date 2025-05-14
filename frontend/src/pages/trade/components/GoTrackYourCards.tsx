import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'

export function GoTrackYourCards() {
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>Go track your cards</AlertTitle>
        <AlertDescription>
          By tracking your cards, you can see what cards you still need to get, what cards you can trade with friends, and how many trade tokens you can earn
          with your current collection.
        </AlertDescription>
      </Alert>
    </article>
  )
}
