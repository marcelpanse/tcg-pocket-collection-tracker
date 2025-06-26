import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Siren } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function UserNotLoggedIn() {
  const { t } = useTranslation('pages/trade')
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>{t('notLoggedIn.title')}</AlertTitle>
        <AlertDescription>{t('notLoggedIn.description')}</AlertDescription>
      </Alert>
    </article>
  )
}
