import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../lib/Auth.ts'

export const Verify = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [errorLoggingIn, setErrorLoggingIn] = useState(false)

  useEffect(() => {
    login()
      .then((user) => {
        if (user) {
          console.log('logged in')
          setLoggedIn(true)
        } else {
          setErrorLoggingIn(true)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div>
      <h5>
        {errorLoggingIn && <span style={{ color: 'red' }}>Error logging in</span>}
        {!loggedIn && !errorLoggingIn && 'Logging in...'}
        {loggedIn && 'Logged in!'}
      </h5>
      <Link to="/">Go to home</Link>
    </div>
  )
}
