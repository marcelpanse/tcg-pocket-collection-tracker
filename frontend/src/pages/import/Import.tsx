import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { ImportReader } from './components/ImportReader'

function Import() {
  const { t } = useTranslation('pages/import')
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={t('loggedOut.title')} paragraph={t('loggedOut.description')} className="bg-gray-400" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard title={t('title')} paragraph={t('description')} className="bg-amber-600" />
      <div className="w-full border-2 border-indigo-600 rounded-xl p-4 text-center">
        <ImportReader />
      </div>
    </div>
  )
}

export default Import
