import { Siren } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'

export function NoTradeableCards() {
  const { t } = useTranslation('pages/trade')
  return (
    <article className="mx-auto grid max-w-4xl gap-5">
      <Alert className="mb-8 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>{t('noTradeableCards.title')}</AlertTitle>
        <AlertDescription>{t('noTradeableCards.description')}</AlertDescription>
      </Alert>
    </article>
  )
}
