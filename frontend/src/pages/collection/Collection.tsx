import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { FriendIdDisplay } from '@/components/ui/friend-id-display'
import { useAccount, usePublicAccount } from '@/services/account/useAccount.ts'
import { useCollection, usePublicCollection } from '@/services/collection/useCollection'
import type { CollectionRow } from '@/types'
import CollectionCards from './CollectionCards'

function OwnCollection() {
  const { data: account, isLoading: isLoadingAccount } = useAccount()
  const { data: cards = new Map<number, CollectionRow>(), isLoading: isLoadingCards } = useCollection()
  if (isLoadingAccount && isLoadingCards) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }
  return <CollectionCards cards={cards} isPublic={false} share={account !== undefined && account.friend_id !== '' && account.is_public} />
}

function FriendCollection({ friendId }: { friendId: string }) {
  const { t } = useTranslation(['pages/collection', 'common'])
  const { data: account, isLoading: isLoadingAccount } = usePublicAccount(friendId)
  const { data: cards, isLoading: isLoadingCards } = usePublicCollection(friendId)

  if (isLoadingAccount || isLoadingCards) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
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
    <div className="flex flex-col gap-y-1">
      <CollectionCards cards={cards} isPublic={true}>
        <div className="flex justify-between my-2">
          <h1>
            <span className="text-2xl font-light">{t('collectionOf')}</span>
            <span className="text-2xl font-bold"> {account.username} </span>
            <span className="block sm:inline text-sm">
              <FriendIdDisplay friendId={account.friend_id} />
            </span>
          </h1>
          <Link to={`/trade/${friendId}`}>
            <Button>
              {t('showPossibleTrades')}
              <ChevronRight />
            </Button>
          </Link>
        </div>
      </CollectionCards>
    </div>
  )
}

export default function Collection() {
  const navigate = useNavigate()

  const { friendId: rawFriendId } = useParams()
  const { data: account, isLoading: isLoadingAccount } = useAccount()

  useEffect(() => {
    if (!rawFriendId && !isLoadingAccount && account?.friend_id) {
      navigate(`/collection/${account.friend_id}`, { replace: true })
    }
  }, [isLoadingAccount, rawFriendId, account?.friend_id, navigate])

  if (isLoadingAccount) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }

  const friendId = rawFriendId ?? account?.friend_id

  if (friendId && friendId !== account?.friend_id) {
    return <FriendCollection friendId={friendId} />
  } else {
    return <OwnCollection />
  }
}
