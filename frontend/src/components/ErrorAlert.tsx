import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export default function ErrorAlert() {
  const { t } = useTranslation('common')
  return (
    <Alert className="mx-auto mt-12 max-w-lg">
      <AlertTitle className="text-lg">{t('error')}</AlertTitle>
      <AlertDescription>
        <p>Refresh the page to try again.</p>
        <p>
          If that doesn't work, let us know by filing a bug report{' '}
          <a className="underline" href="https://community.tcgpocketcollectiontracker.com/">
            here
          </a>
          .
        </p>
      </AlertDescription>
    </Alert>
  )
}
