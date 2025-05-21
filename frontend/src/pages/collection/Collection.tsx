import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel from '@/components/FiltersPanel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { fetchPublicAccount } from '@/lib/fetchAccount.ts'
import { fetchCollection } from '@/lib/fetchCollection.ts'
import CardDetail from '@/pages/collection/CardDetail.tsx'
import type { AccountRow, Card, CollectionRow } from '@/types'
import loadable from '@loadable/component'
import { Siren } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { useLocation, useNavigate, useParams } from 'react-router'

const TradeMatches = loadable(() => import('./TradeMatches.tsx'))

function Collection() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['pages/collection'])
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

  const { ownedCards, selectedCardId, setSelectedCardId } = useContext(CollectionContext)
  const { account } = useContext(UserContext)
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)
  const [friendAccount, setFriendAccount] = useState<AccountRow | null>(null)
  const [friendCards, setFriendCards] = useState<CollectionRow[] | null>(null)
  const [filteredCards, setFilteredCards] = useState<Card[] | null>(null)

  useEffect(() => {
    const friendId = params.friendId
    if (friendId && !friendCards) {
      console.log('fetching collection by friend id', friendId)
      fetchPublicAccount(friendId)
        .then((account) => {
          console.log('friend account', account)
          setFriendAccount(account)
        })
        .catch(console.error)

      fetchCollection(undefined, friendId)
        .then((cards) => {
          if (cards.length === 0) {
            console.log('not a public collection, going back to normal mode.')
            navigate('/collection')
          }
          setFriendCards(cards)
        })
        .catch(console.error)
    } else if (!friendId && friendCards) {
      // NOTE: because the card table is hard to refresh, we have to reload the page. This is a bit of a hack, but it works. If you figure  a better way, please let me know.
      window.location.reload()
    }
  }, [params])

  useEffect(() => {
    return () => {
      setFriendCards(null)
    }
  }, [])

  const cardCollection = useMemo(() => {
    // if friendId is in the url, return friendCards, otherwise return ownedCards. FriendCards can be null if they are still loading.
    if (params.friendId) {
      return friendCards
    }
    return ownedCards || []
  }, [ownedCards, friendCards])

  useEffect(() => {
    setResetScrollTrigger(true)

    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)

    return () => clearTimeout(timeout)
  }, [filteredCards])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <FilterPanel
        cards={cardCollection}
        onFiltersChanged={(cards) => setFilteredCards(cards)}
        visibleFilters={{ expansions: !isMobile, search: true, owned: !isMobile, rarity: !isMobile }}
        filtersDialog={{ expansions: true, pack: true, search: true, owned: true, rarity: true, amount: true }}
        batchUpdate={Boolean(!friendCards)}
        share
      >
        <div>
          {friendCards && (
            <Alert className="mb-4 border-1 border-neutral-700 shadow-none">
              <Siren className="h-4 w-4" />
              <AlertTitle>{t('publicCollectionTitle', { username: friendAccount?.username })}</AlertTitle>
              <AlertDescription>
                <div className="flex items-center">
                  {t('publicCollectionDescription')}
                  <Button
                    className="mb-4"
                    onClick={() => {
                      navigate(`${location.pathname}/trade`)
                    }}
                  >
                    Show possible trades
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </FilterPanel>
      <div>{filteredCards && <CardsTable cards={filteredCards} resetScrollTrigger={resetScrollTrigger} showStats />}</div>
      <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />
      <TradeMatches
        ownedCards={ownedCards}
        friendCards={friendCards || []}
        ownCollection={params.friendId === account?.friend_id}
        friendAccount={friendAccount}
      />
    </div>
  )
}

export default Collection
