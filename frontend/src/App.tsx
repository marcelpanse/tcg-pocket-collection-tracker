import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.tsx'
import { Verify } from './pages/Verify.tsx'
import { Header } from './components/ui/Header.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { Overview } from './pages/Overview.tsx'
import { Collection } from './pages/Collection.tsx'
import { Pokedex } from './pages/Pokedex.tsx'
import { Trade } from './pages/Trade.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/trade" element={<Trade />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
