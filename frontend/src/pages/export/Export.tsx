import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'

function Export() {
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={'Sign up to export your collection'} paragraph={'To export your collection, please log in.'} className="bg-gray-400" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard title={'Feature incoming'} paragraph={'Export collection feature is coming soon.'} className="bg-gray-400" />
    </div>
  )
}

export default Export
