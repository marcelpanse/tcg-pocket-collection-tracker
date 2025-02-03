import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.tsx'
import { Verify } from './pages/Verify.tsx'
import { Header } from './components/ui/Header.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from './components/ui/button.tsx'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
