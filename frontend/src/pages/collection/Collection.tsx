import { Siren } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAccount, usePublicAccount } from '@/services/account/useAccount.ts'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import type { CollectionRow } from '@/types'
import CollectionCards from './CollectionCards'

function OwnCollection() {
  const { t } = useTranslation('common')
  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: cards = new Map<number, CollectionRow>(), isLoading: isLoadingCards } = useCollection()
  if (isLoadingAccount && isLoadingCards) {
    return <p className="text-xl text-center py-8">{t('common:loading')}</p>
  }
  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <CollectionCards cards={cards} isPublic={false} extraOffset={20} share={account !== undefined && account.friend_id !== '' && account.is_public} />
    </div>
  )
}

function FriendCollection({ friendId }: { friendId: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation(['pages/collection', 'common'])
  const { data: account, isLoading: isLoadingAccount } = usePublicAccount(friendId)
  const { data: cards, isLoading: isLoadingCards } = usePublicCollection(friendId)

  if (isLoadingAccount || isLoadingCards) {
    return <p className="text-xl text-center py-8">{t('common:loading')}</p>
  }
  if (account === undefined || cards === undefined) {
    return <p className="text-xl text-center py-8">Something went wrong</p>
  }

  if (account === null) {
    return <p className="text-xl text-center py-8">{t('common:noAccount')}</p>
  }
  if (cards === null) {
    return <p className="text-xl text-center py-8">Not a public account</p>
  }

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <Alert className="mb-1 border-1 border-neutral-700 shadow-none">
        <Siren className="h-4 w-4" />
        <AlertTitle>{t('publicCollectionTitle', { username: account.username })}</AlertTitle>
        <AlertDescription>
          <div className="flex items-center">
            {t('publicCollectionDescription')}
            <Button className="mb-4" onClick={() => navigate(`/trade/${friendId}`)}>
              {t('showPossibleTrades')}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      <CollectionCards cards={cards} isPublic={true} extraOffset={124} />
    </div>
  )
}

function Collection() {
  const { t } = useTranslation(['pages/collection', 'common'])
  const navigate = useNavigate()

  const { friendId: rawFriendId } = useParams()
  const { data: account, isLoading: isLoadingAccount } = useAccount()

  useEffect(() => {
    if (!isLoadingAccount && !rawFriendId && account?.friend_id) {
      navigate(`/collection/${account.friend_id}`, { replace: true })
    }
  }, [isLoadingAccount, rawFriendId, account?.friend_id, navigate])

  if (isLoadingAccount) {
    return <p className="text-xl text-center py-8">{t('common:loading')}</p>
  }

  const friendId = rawFriendId ?? account?.friend_id

  if (friendId && friendId !== account?.friend_id) {
    return <FriendCollection friendId={friendId} />
  } else {
    return <OwnCollection />
  }
}

export default Collection
