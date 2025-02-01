import type { Models } from 'appwrite'
import { useEffect, useState } from 'react'
import { getUser, logout, sendMagicLink } from '../lib/Auth'

export const Home = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    getUser().then((user) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  return (
    <div>
      <h1>TCG Pocket Collection Tracker</h1>
      {!user && !emailSent && (
        <div className="card">
          <input type="text" placeholder="email" onChange={(e) => setEmailInput(e.target.value)} />
          <button
            type="button"
            onClick={async () => {
              //TODO: validate email with regex
              if (emailInput) {
                await sendMagicLink(emailInput)
                setEmailSent(true)
              } else {
                // TODO: show error in Snackbar
              }
            }}
          >
            login / signup
          </button>
        </div>
      )}
      {emailSent && <h2>Check your email for a login link!</h2>}
      {user && (
        <>
          <h2>Hi {user.email}</h2>
          <button
            type="button"
            onClick={async () => {
              await logout()
              setUser(null)
            }}
          >
            logout
          </button>
        </>
      )}
    </div>
  )
}
