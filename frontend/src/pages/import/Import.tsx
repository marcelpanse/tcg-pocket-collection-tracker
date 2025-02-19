import { Button } from '@/components/ui/button'
import { TitleCard } from '@/components/ui/title-card'
import { UserContext } from '@/lib/context/UserContext'
import { use } from 'react'
import { Link } from 'react-router'
import { ExcelReader } from './components/ExcelReader'

function Import() {
  const { user } = use(UserContext)

  if (!user) {
    return <TitleCard title={'Sign up to import your cards'} paragraph={'To import your spreadsheet, please log in.'} backgroundColor="#777777" />
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-[900px] mx-auto">
      <TitleCard
        title={'Import Disclaimer'}
        paragraph={
          'This import feature will OVERWRITE your current collection with the values from the database.  ONLY do this process if your spreadsheet contains the exact count values you want in your collection.'
        }
        backgroundColor="#FF0000"
      />
      <div className="w-full text-center">
        <Link to={'https://docs.google.com/spreadsheets/d/1AsnYR7IsEiHyrnxfwyRO-wEZbWj33fIICjSqBw9VCcM/copy?usp=sharing'}>
          <Button variant="outline">Download Fresh Spreadsheet</Button>
        </Link>
      </div>
      <div className="w-full border-2 border-indigo-600 rounded-xl p-4 text-center">
        <ExcelReader />
      </div>
    </div>
  )
}

export default Import
