import type { Models } from 'appwrite'
import { useEffect, useState } from 'react'
import { Cards } from '../components/Cards.tsx'
import { Login } from '../components/Login.tsx'
import { getUser, logout } from '../lib/Auth'

export const Home = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)

  useEffect(() => {
    getUser().then((user) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  return (
    <div className="flex flex-col justify-center items-center m-40">
      <h1 className="text-3xl font-bold">TCG Pocket Collection Tracker</h1>
      <p className="mb-5">Work in progress, check back soon!</p>
      {!user && <Login />}
      {user && (
        <>
          <h2>Hi {user.email}</h2>
          <button
            className="cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="button"
            onClick={async () => {
              await logout()
              setUser(null)
            }}
          >
            logout
          </button>

          <Cards user={user} />
        </>
      )}
    </div>
  )
}
