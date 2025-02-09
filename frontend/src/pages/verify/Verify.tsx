import { type LoginPromise, useLogin } from '@/lib/hooks/useLogin'
import { Suspense, use, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props {
  login: LoginPromise
}

function Verify({ login }: Props) {
  const user = use(login)

  useEffect(() => {
    window.location.href = '/'
  }, [user])

  return <span>Logged in! Redirecting...</span>
}

function VerifyContainer() {
  const login = useLogin()

  return (
    <div className="m-40 flex flex-col items-center justify-center">
      <h5 className="mb-5">
        <ErrorBoundary fallback={<span className="text-red-500">Error logging in!</span>}>
          <Suspense fallback={<span>Logging in...</span>}>
            <Verify login={login} />
          </Suspense>
        </ErrorBoundary>
      </h5>
    </div>
  )
}

export default VerifyContainer
