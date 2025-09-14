import { Siren } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { usePublicAccount } from '@/services/account/useAccount.ts'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import CollectionCards from './CollectionCards'
import { Missions } from './Missions'

function Collection() {
  const { t } = useTranslation(['pages/collection'])

  const { friendId } = useParams()
  const navigate = useNavigate()

  const { data: friendAccount } = usePublicAccount(friendId)
  const { data: friendCards } = usePublicCollection(friendId)

  const { data: ownedCards } = useCollection()

  const [missions, setMissions] = useState(false)

  if (friendId) {
    if (friendAccount === null) {
      return <p className="text-xl text-center py-8">Account not found</p>
    } else if (friendCards === null) {
      return <p className="text-xl text-center py-8">Not a public account</p>
    } else if (friendCards === undefined || friendAccount === undefined) {
      return <p className="text-xl text-center py-8">Loading...</p>
    }

    return (
      <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
        <Alert className="mb-4 border-1 border-neutral-700 shadow-none">
          <Siren className="h-4 w-4" />
          <AlertTitle>{t('publicCollectionTitle', { username: friendAccount?.username })}</AlertTitle>
          <AlertDescription>
            <div className="flex items-center">
              {t('publicCollectionDescription')}
              <Button className="mb-4" onClick={() => navigate(`/trade/${friendAccount?.friend_id}`)}>
                {t('showPossibleTrades')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <CollectionCards cards={friendCards} isPublic={true} extraOffset={136} />
      </div>
    )
  }

  if (ownedCards === undefined) {
    return <p className="text-xl text-center py-8">Loading...</p>
  }

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      {missions ? (
        <Missions onSwitchToCards={() => setMissions(false)} />
      ) : (
        <CollectionCards cards={ownedCards} isPublic={false} extraOffset={20} onSwitchToMissions={() => setMissions(true)} />
      )}
    </div>
  )
}

export default Collection
