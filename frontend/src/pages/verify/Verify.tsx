import { login } from '@/lib/Auth.ts'
import { Suspense, use, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useNavigate } from 'react-router'

function Verify() {
  const user = use(login())
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user])

  return <span>Logged in! Redirecting...</span>
}

function VerifyContainer() {
  return (
    <div className="m-40 flex flex-col items-center justify-center">
      <h5 className="mb-5">
        <ErrorBoundary fallback={<span className="text-red-500">Error logging in!</span>}>
          <Suspense fallback={<span>Logging in...</span>}>
            <Verify />
          </Suspense>
        </ErrorBoundary>
      </h5>
    </div>
  )
}

export default VerifyContainer
