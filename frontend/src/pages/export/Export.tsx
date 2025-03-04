import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'
import { ExportWriter } from './components/ExportWriter'

function Export() {
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={'Sign up to export your collection'} paragraph={'To export your collection, please log in.'} className="bg-gray-400" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard
        title={'Export Disclaimer'}
        paragraph={'This export feature will export your current collection with the values from the database.'}
        className="bg-amber-600"
      />
      <div className="w-full border-2 border-indigo-600 rounded-xl p-4 text-center">
        <ExportWriter />
      </div>
    </div>
  )
}

export default Export
