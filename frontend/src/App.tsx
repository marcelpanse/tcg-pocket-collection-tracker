import { Account, Client, ID, type Models } from 'appwrite'
import { useEffect, useState } from 'react'
import './App.css'
const client = new Client()
client.setProject('679d358b0013b9a1797f')

function App() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    login().catch(console.error)
  }, [])

  const login = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const secret = urlParams.get('secret')
    const userId = urlParams.get('userId')

    const isLogged = await checkIfLoggedIn()
    if (!isLogged && secret && userId) {
      const account = new Account(client)
      const session = await account.createSession(userId, secret)
      console.log('user logged in via link', session)
      await checkIfLoggedIn()
    }
  }

  const checkIfLoggedIn = async () => {
    try {
      const account = new Account(client)
      const user = await account.get()
      setUser(user)
      // Logged in
      console.log('user is logged in', user)
      return true
    } catch (_e) {
      // Not logged in
      return false
    }
  }

  const sendMagicLink = async () => {
    if (!emailInput) {
      //TODO: need tailwind snackbar with warning
      return
    }

    //TODO: validate email with regex

    const account = new Account(client)

    const token = await account.createMagicURLToken(ID.unique(), 'marcel.panse@gmail.com', `${window.location.origin}/verify`)
    console.log(token)

    setEmailSent(true)
  }

  const logout = async () => {
    const account = new Account(client)

    const result = await account.deleteSession('current')
    console.log('logged out', result)
    setUser(null)
  }

  // TODO: split into routes and protect with auth (see: https://appwrite.io/docs/products/auth/quick-start)
  return (
    <>
      <h1>TCG Pocket Collection Tracker</h1>
      {!user && !emailSent && (
        <div className="card">
          <input type="text" placeholder="email" onChange={(e) => setEmailInput(e.target.value)} />
          <button type="button" onClick={() => sendMagicLink()}>
            login / signup
          </button>
        </div>
      )}
      {emailSent && <h2>Check your email for a login link!</h2>}
      {user && (
        <>
          <h2>Hi {user.email}</h2>
          <button type="button" onClick={() => logout()}>
            logout
          </button>
        </>
      )}
    </>
  )
}

export default App
