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
    <div className="flex flex-col gap-y-4 mx-auto">
      <TitleCard title="Export" paragraph="This will export your current collection to a CSV file." className="bg-amber-600" />
      <div className="w-full text-center">
        <ExportWriter />
      </div>
    </div>
  )
}

export default Export
