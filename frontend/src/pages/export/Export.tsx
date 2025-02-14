import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'
import { GradientCard } from '../overview/components/GradientCard'

function Export() {
  const { user } = use(UserContext)

  if (!user) {
    return <GradientCard title={'Sign up to export your collection'} paragraph={'To export your collection, please log in.'} backgroundColor="#777777" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <GradientCard title={'Feature Incoming'} paragraph={'Export collection feature is incoming.'} backgroundColor="#777777" />
    </div>
  )
}

export default Export
