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
const Verify = loadable(() => import('./pages/verify/Verify.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])

  useEffect(() => {
    getUser().then(setUser).catch(console.error)
  }, [])

  useEffect(() => {
    if (user) {
      fetchCollection().then(setOwnedCards).catch(console.error)
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, signOut: () => setUser(null) }}>
      <CollectionContext.Provider value={{ ownedCards, setOwnedCards }}>
        <Toaster />
        <Header />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/trade" element={<Trade />} />
        </Routes>
      </CollectionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
