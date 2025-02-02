import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.tsx'
import { Verify } from './pages/Verify.tsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
