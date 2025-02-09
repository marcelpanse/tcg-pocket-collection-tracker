import { login } from '@/lib/Auth.ts'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function Verify() {
  useEffect(() => {
    login()
      .then((user) => {
        if (user) {
          console.log('logged in')
          window.location.href = '/'
        } else {
          throw new Error('Error logging in!')
        }
      })
      .catch(console.error)
  }, [])

  return <span>Logged in! Redirecting...</span>
}

function VerifyContainer() {
  return (
    <div className="m-40 flex flex-col items-center justify-center">
      <h5 className="mb-5">
        <ErrorBoundary fallback={<span className="text-red-500">Error logging in!</span>}>
          {/*<Suspense fallback={<span>Logging in...</span>}>*/}
          <Verify />
          {/*</Suspense>*/}
        </ErrorBoundary>
      </h5>
    </div>
  )
}

export default VerifyContainer
