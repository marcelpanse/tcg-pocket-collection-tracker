import { getUser } from '@/lib/Auth.ts'
import type { CollectionRow } from '@/types'
import loadable from '@loadable/component'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { Header } from './components/ui/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { CollectionContext } from './lib/context/CollectionContext.ts'
import { type User, UserContext } from './lib/context/UserContext.ts'
import { fetchCollection } from './lib/fetchCollection.ts'

// Lazy import for chunking
const Overview = loadable(() => import('./pages/overview/Overview.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))
const Community = loadable(() => import('./pages/community/Community.tsx'))

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  useEffect(() => {
    getUser().then(setUser).catch(console.error)
  }, [])

  useEffect(() => {
    if (user) {
      fetchCollection().then(setOwnedCards).catch(console.error)
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser, isLoginDialogOpen, setIsLoginDialogOpen }}>
      <CollectionContext.Provider value={{ ownedCards, setOwnedCards }}>
        <Toaster />
        <Header />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </CollectionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
