import { Navigate, Route, Routes, redirect } from 'react-router-dom'
import './App.css'
import { getUser } from './lib/Auth.ts'
import { Collection } from './pages/Collection.tsx'
import { Home } from './pages/Home.tsx'
import { Verify } from './pages/Verify.tsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route
          path="/collection"
          element={<Collection />}
          loader={async () => {
            const user = await getUser()
            if (user) {
              return user
            } else {
              throw redirect('/')
            }
          }}
        />
        <Route element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
