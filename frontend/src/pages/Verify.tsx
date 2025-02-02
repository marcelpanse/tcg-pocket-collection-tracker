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
    <div className="flex flex-col justify-center items-center m-40">
      <h5 className="mb-5">
        {errorLoggingIn && <span style={{ color: 'red' }}>Error logging in</span>}
        {!loggedIn && !errorLoggingIn && 'Logging in...'}
        {loggedIn && 'Logged in!'}
      </h5>
      <Link
        to="/"
        className="cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Go to home
      </Link>
    </div>
  )
}
