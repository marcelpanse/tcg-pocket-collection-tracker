import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

interface Props {
  error?: Error
}

export default function ErrorAlert({ error }: Props) {
  const { t } = useTranslation('common')
  console.warn('dupa', error?.message, error?.stack)
  return (
    <Alert className="mt-12 mx-auto max-w-xl">
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
        {error !== undefined && (
          <p>
            Please include the following error message:
            <span className="block font-mono border-1 border-neutral-700 p-1 rounded mt-1">{error.message}</span>
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}
