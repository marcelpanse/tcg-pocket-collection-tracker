import { ThemeProvider } from '@/components/theme-provider'
import { getUser } from '@/lib/Auth.ts'
import type { Models } from 'appwrite'
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

  useEffect(() => {
    getUser().then((user) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="tcgpct-ui-theme">
      <Toaster />
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/collection" element={<Collection user={user} />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/trade" element={<Trade />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
