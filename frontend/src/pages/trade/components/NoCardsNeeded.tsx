import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'

export function NoCardsNeeded() {
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>You have all tradeable cards!</AlertTitle>
        <AlertDescription>Make sure you come back here when new rarities and packs are available for trade.</AlertDescription>
      </Alert>
    </article>
  )
}
