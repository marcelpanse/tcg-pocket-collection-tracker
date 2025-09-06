import { useTranslation } from 'react-i18next'
import { TitleCard } from '@/components/ui/title-card'
import { useUser } from '@/services/auth/useAuth'
import { ExportWriter } from './components/ExportWriter'

function Export() {
  const { t } = useTranslation('pages/export')
  const { data: user } = useUser()

  if (!user) {
    return <TitleCard title={t('loggedOut.title')} paragraph={t('loggedOut.description')} className="bg-gray-400" />
  }

  return (
    <div className="flex flex-col gap-y-4 mx-auto">
      <TitleCard title={t('title')} paragraph={t('description')} className="bg-amber-600" />
      <div className="w-full text-center">
        <ExportWriter />
      </div>
    </div>
  )
}

export default Export
