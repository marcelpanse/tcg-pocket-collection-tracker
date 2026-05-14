import { Siren } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/Spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/services/auth/useAuth'
import { ExportWriter } from '../export/components/ExportWriter'
import { ImportReader } from './components/ImportReader'

function Import() {
  const { t } = useTranslation('pages/import')
  const { data: user, isLoading } = useUser()

  if (isLoading) {
    return <Spinner size="lg" overlay />
  }
  if (!user) {
    return (
      <Alert className="max-w-[900px] mx-auto">
        <AlertTitle className="text-lg">{t('loggedOut.title')}</AlertTitle>
        <AlertDescription>{t('loggedOut.description')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Tabs defaultValue="import" className="flex flex-col max-w-[900px] mx-auto">
      <TabsList className="gap-4 mb-6 border-b-1 border-neutral-700 bg-transparent">
        <TabsTrigger className="text-md" value="import">
          {t('import.title')}
        </TabsTrigger>
        <TabsTrigger className="text-md" value="export">
          {t('export.title')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="import">
        <Alert>
          <Siren className="size-4" />
          <AlertTitle className="text-lg">{t('import.title')}</AlertTitle>
          <AlertDescription>{t('import.description')}</AlertDescription>
        </Alert>
        <ImportReader />
      </TabsContent>
      <TabsContent value="export">
        <Alert>
          <AlertTitle className="text-lg">{t('export.title')}</AlertTitle>
          <AlertDescription>{t('export.description')}</AlertDescription>
        </Alert>
        <ExportWriter />
      </TabsContent>
    </Tabs>
  )
}

export default Import
