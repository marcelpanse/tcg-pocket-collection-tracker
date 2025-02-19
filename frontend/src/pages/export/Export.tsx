import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'

function Export() {
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={'Sign up to export your collection'} paragraph={'To export your collection, please log in.'} backgroundColor="#777777" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard title={'Feature Incoming'} paragraph={'Export collection feature is incoming.'} backgroundColor="#777777" />
    </div>
  )
}

export default Export
