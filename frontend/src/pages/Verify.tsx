import { useEffect, useState } from 'react'
import { login } from '../lib/Auth.ts'

export const Verify = () => {
  const [errorLoggingIn, setErrorLoggingIn] = useState(false)

  useEffect(() => {
    login()
      .then((user) => {
        if (user) {
          console.log('logged in')
          window.location.href = '/'
        } else {
          setErrorLoggingIn(true)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col justify-center items-center m-40">
      <h5 className="mb-5">
        {errorLoggingIn && <span style={{ color: 'red' }}>Error logging in!</span>}
        {!errorLoggingIn && 'Logging in...'}
      </h5>
    </div>
  )
}
