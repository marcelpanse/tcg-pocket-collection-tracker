import InstallPrompt from '@/components/InstallPrompt.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { authSSO, getUser } from '@/lib/Auth.ts'
import { fetchAccount } from '@/lib/fetchAccount.ts'
import CardDetail from '@/pages/collection/CardDetail.tsx'
import type { AccountRow, CollectionRow } from '@/types'
import loadable from '@loadable/component'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes } from 'react-router'
import { Header } from './components/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { CollectionContext } from './lib/context/CollectionContext.ts'
import { type User, UserContext } from './lib/context/UserContext.ts'
import { fetchCollection } from './lib/fetchCollection.ts'

// Lazy import for chunking
const Overview = loadable(() => import('./pages/overview/Overview.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))
const Community = loadable(() => import('./pages/community/Community.tsx'))
const EditProfile = loadable(() => import('./components/EditProfile.tsx'))

function App() {
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<AccountRow | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState('')

  useEffect(() => {
    getUser().then(setUser).catch(console.error)
  }, [])

  useEffect(() => {
    if (user) {
      // check if query params sso & sig are set
      const params = new URLSearchParams(window.location.search)
      const sso = params.get('sso')
      const sig = params.get('sig')
      if (sso && sig) {
        toast({ title: 'Logging in', description: 'Please wait...', variant: 'default' })
        authSSO(sso, sig).catch(console.error)
      } else {
        fetchCollection().then(setOwnedCards).catch(console.error)
        fetchAccount(user.email).then(setAccount).catch(console.error)
      }
    } else {
      setOwnedCards([]) // in case the user is logged out, clear the cards
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser, account, setAccount, isLoginDialogOpen, setIsLoginDialogOpen, isProfileDialogOpen, setIsProfileDialogOpen }}>
      <CollectionContext.Provider value={{ ownedCards, setOwnedCards, selectedCardId, setSelectedCardId }}>
        <ErrorBoundary fallback={<div className="m-4">A new version was deployed, please refresh the page to see the latest changes.</div>}>
          <Toaster />
          <Header />
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/community" element={<Community />} />
          </Routes>
          <EditProfile account={account} setAccount={setAccount} isProfileDialogOpen={isProfileDialogOpen} setIsProfileDialogOpen={setIsProfileDialogOpen} />
          <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />
          <InstallPrompt />
        </ErrorBoundary>
      </CollectionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
