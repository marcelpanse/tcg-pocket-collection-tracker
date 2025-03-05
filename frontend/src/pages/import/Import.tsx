import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'
import { ImportReader } from './components/ImportReader'

function Import() {
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={'Sign up to import your cards'} paragraph={'To import your spreadsheet, please log in.'} className="bg-gray-400" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard
        title="Import"
        paragraph="This will OVERWRITE your current collection with the values from the imported CSV file. ONLY do this process if your spreadsheet contains the exact count values you want in your collection."
        className="bg-amber-600"
      />
      <div className="w-full border-2 border-indigo-600 rounded-xl p-4 text-center">
        <ImportReader />
      </div>
    </div>
  )
}

export default Import
