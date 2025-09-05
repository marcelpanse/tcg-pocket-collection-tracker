import loadable from '@loadable/component'
import { useEffect, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createHashRouter, Navigate, Outlet, RouterProvider, useLocation, useParams } from 'react-router'
import DonationPopup from '@/components/DonationPopup.tsx'
import InstallPrompt from '@/components/InstallPrompt.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { authSSO, supabase } from '@/lib/Auth.ts'
import { fetchAccount } from '@/lib/fetchAccount.ts'
import { friendCollectionLoader } from '@/lib/friendCollectionLoader.ts'
import type { AccountRow, CollectionRow, CollectionRowUpdate } from '@/types'
import { Header } from './components/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { CollectionContext } from './lib/context/CollectionContext.ts'
import { type User, UserContext } from './lib/context/UserContext.ts'
import { fetchOwnCollection, getCollectionFromCache, updateCollectionCache } from './lib/fetchCollection.ts'

// Lazy import for chunking
const Overview = loadable(() => import('./pages/overview/Overview.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Decks = loadable(() => import('./pages/decks/Decks.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))
const TradeWith = loadable(() => import('./pages/trade/TradeWith.tsx'))
const EditProfile = loadable(() => import('./components/EditProfile.tsx'))
const CardDetail = loadable(() => import('./pages/collection/CardDetail.tsx'))

const TradeWithRedirect = () => {
  const { friendId } = useParams()
  return <Navigate to={`/trade/${friendId}`} replace />
}

function Analytics() {
  const location = useLocation()
  useEffect(() => {
    // @ts-expect-error
    window.umami?.track((props) => ({ ...props, url: location.pathname }))
  }, [location])
  return null
}

function App() {
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<AccountRow | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState('')
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])

  const updateCards = async (rowsToUpdate: CollectionRowUpdate[]) => {
    if (!user || !user.user.email) {
      throw new Error('App.tsx:updateCards: User not logged in')
    }
    const email = user.user.email

    const now = new Date()
    const nowString = now.toISOString()
    const rows: CollectionRow[] = rowsToUpdate.map((row) => ({ ...row, email, updated_at: nowString }))

    const { error: error1, data } = await supabase
      .from('accounts')
      .upsert({ ...account, collection_last_updated: now })
      .select()
      .single()
    if (error1) {
      throw new Error(`App.tsx:updateCards: Error modyfing account: ${error1.message}`)
    }
    const { error: error2 } = await supabase.from('collection').upsert(rows)
    if (error2) {
      setAccount(data as AccountRow)
      throw new Error(`App.tsx:updateCards: Error bulk updating collection: ${error2.message}`)
    }

    // we can't trust ownedCards to already be updated, so we'll have to get the latest from cache.
    const latestFromCache = getCollectionFromCache(email) || ownedCards
    const updatedCards = latestFromCache.map((row) => {
      const updated = rowsToUpdate.find((r) => r.card_id === row.card_id)
      if (updated === undefined) {
        return row
      } else {
        return { ...row, ...updated }
      }
    })
    const newlyAdded = rows.filter((row) => latestFromCache.find((r) => r.card_id === row.card_id) === undefined)
    updatedCards.push(...newlyAdded)
    setOwnedCards(updatedCards)

    updateCollectionCache(updatedCards, email, now)
    setAccount(data as AccountRow)
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      // check if query params sso & sig are set
      const params = new URLSearchParams(window.location.search)
      const sso = params.get('sso')
      const sig = params.get('sig')
      if (sso && sig) {
        toast({ title: 'Logging in', description: 'Please wait...', variant: 'default' })
        authSSO(user, sso, sig).catch(console.error)
      } else if (user.user.email) {
        fetchAccount(user.user.email).then(setAccount).catch(console.error)
      }
    } else {
      setOwnedCards([]) // in case the user is logged out, clear the cards
      setAccount(null)
    }
  }, [user])

  useEffect(() => {
    if (account && user?.user.email) {
      const email = user.user.email
      if (!account.collection_last_updated) {
        updateCards([]) // timetamp is missing from db, artifically update it
          .then(() => fetchOwnCollection(email, new Date()))
          .then(setOwnedCards)
          .catch(console.error)
      } else {
        fetchOwnCollection(email, new Date(account.collection_last_updated)).then(setOwnedCards).catch(console.error)
      }
    }
  }, [account])

  const userContextValue = useMemo(
    () => ({
      user,
      setUser,
      account,
      setAccount,
      isLoginDialogOpen,
      setIsLoginDialogOpen,
      isProfileDialogOpen,
      setIsProfileDialogOpen,
    }),
    [user, account, isLoginDialogOpen, isProfileDialogOpen],
  )

  const collectionContextValue = useMemo(
    () => ({
      ownedCards,
      updateCards,
      selectedCardId,
      setSelectedCardId,
      selectedMissionCardOptions,
      setSelectedMissionCardOptions,
    }),
    [ownedCards, selectedCardId, selectedMissionCardOptions],
  )

  const errorDiv = <div className="m-4">A new version was deployed, please refresh the page to see the latest changes.</div>

  const router = createHashRouter([
    {
      element: (
        <>
          <Analytics />
          <Header />
          <Outlet />
          <EditProfile account={account} setAccount={setAccount} isProfileDialogOpen={isProfileDialogOpen} setIsProfileDialogOpen={setIsProfileDialogOpen} />
        </>
      ),
      errorElement: errorDiv,
      children: [
        { path: '/', element: <Overview /> },
        { path: '/collection/:friendId?', element: <Collection />, loader: friendCollectionLoader },
        { path: '/decks', element: <Decks /> },
        { path: '/trade', element: <Trade /> },
        { path: '/trade/:friendId', element: <TradeWith />, loader: friendCollectionLoader },
        { path: '/collection/:friendId/trade', element: <TradeWithRedirect /> }, // support old trading path
      ],
    },
  ])

  return (
    <UserContext.Provider value={userContextValue}>
      <CollectionContext.Provider value={collectionContextValue}>
        <ErrorBoundary fallback={errorDiv}>
          <Toaster />
          <RouterProvider router={router} />
          <InstallPrompt />
          <DonationPopup />
          {selectedCardId && <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />}
        </ErrorBoundary>
      </CollectionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
