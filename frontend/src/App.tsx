import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home.tsx'
import { Verify } from './pages/Verify.tsx'

function App() {
  return (
    <>
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
