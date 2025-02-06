import { ThemeProvider } from '@/components/theme-provider'
import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import { getUser } from '@/lib/Auth.ts'
import type { CollectionRow } from '@/types'
import { type Models, Query } from 'appwrite'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Header } from './components/ui/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { Collection } from './pages/Collection.tsx'
import { Overview } from './pages/Overview.tsx'
import { Pokedex } from './pages/Pokedex.tsx'
import { Trade } from './pages/Trade.tsx'
import { Verify } from './pages/Verify.tsx'

function App() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])

  useEffect(() => {
    getUser().then((user) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      fetchCollection()
    }
  }, [user])

  const fetchCollection = async () => {
    const db = await getDatabase()

    // this gets all your cards at once (max 5k unique cards - there aren't that many unique cards yet), not sure what it does with performance, but we'll see ;-)
    const { documents } = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5000)])

    console.log('documents', documents)
    setOwnedCards(documents as unknown as CollectionRow[])
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="tcgpct-ui-theme">
      <Toaster />
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Overview user={user} ownedCards={ownedCards} />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/collection" element={<Collection user={user} ownedCards={ownedCards} setOwnedCards={setOwnedCards} />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/trade" element={<Trade />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
