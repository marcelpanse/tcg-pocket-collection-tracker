import { lazy } from '@loadable/component'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import pMinDelay from 'p-min-delay'
import { Suspense, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createHashRouter, Navigate, Outlet, RouterProvider, useLocation, useParams } from 'react-router'
import DonationPopup from '@/components/DonationPopup.tsx'
import InstallPrompt from '@/components/InstallPrompt.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { useAuthSSO, useUser } from '@/services/auth/useAuth'
import { Header } from './components/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { DialogContext } from './context/DialogContext.ts'

// Lazy import for chunking
const Overview = lazy(() => pMinDelay(import(/* webpackPrefetch: true */ './pages/overview/Overview.tsx'), 200))
const Collection = lazy(() => import(/* webpackPrefetch: true */ './pages/collection/Collection.tsx'))
const Missions = lazy(() => import(/* webpackPrefetch: true */ './pages/collection/Missions.tsx'))
const Decks = lazy(() => import(/* webpackPrefetch: true */ './pages/decks/Decks.tsx'))
const DeckBuilder = lazy(() => import(/* webpackPrefetch: true */ './pages/decks/DeckBuilder.tsx'))
const Trade = lazy(() => import(/* webpackPrefetch: true */ './pages/trade/Trade.tsx'))
const Scan = lazy(() => import(/* webpackPrefetch: true */ './pages/scan/Scan.tsx'))
const EditProfile = lazy(() => import(/* webpackPrefetch: true */ './components/EditProfile.tsx'))
const CardDetail = lazy(() => import(/* webpackPrefetch: true */ './pages/collection/CardDetail.tsx'))

const TradeWithRedirect = () => {
  const { friendId } = useParams()
  return <Navigate to={`/trade/${friendId}`} replace />
}

function Analytics() {
  const location = useLocation()
  useEffect(() => {
    // @ts-expect-error
    window.umami?.track((props) => ({ ...props, url: location.pathname }))
  }, [location])
  return null
}

function App() {
  const { toast } = useToast()
  const { data: user } = useUser()
  const authSSOQuery = useAuthSSO()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>(undefined)

  // Check for SSO parameters
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search)
      const sso = params.get('sso')
      const sig = params.get('sig')
      if (sso && sig) {
        toast({ title: 'Logging in', description: 'Please wait...', variant: 'default' })

        console.log('invoke sso')
        authSSOQuery.mutate({ user, sso, sig })
      }
    }
  }, [user])

  const errorDiv = <div className="m-4">Something went wrong, please refresh the page to try again.</div>

  const Loading = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full size-12 border-4 border-white border-t-transparent"></div>
    </div>
  )

  const router = createHashRouter([
    {
      element: (
        <>
          <Analytics />
          <Header />
          <Outlet />
          <EditProfile />
        </>
      ),
      errorElement: errorDiv,
      children: [
        {
          path: '/',
          element: (
            <Suspense fallback={<Loading />}>
              <Overview />
            </Suspense>
          ),
        },
        {
          path: '/collection/missions',
          element: (
            <Suspense fallback={<Loading />}>
              <Missions />
            </Suspense>
          ),
        },
        {
          path: '/collection/:friendId?',
          element: (
            <Suspense fallback={<Loading />}>
              <Collection />
            </Suspense>
          ),
        },
        { path: '/collection/:friendId/trade', element: <TradeWithRedirect /> }, // support old trading path
        {
          path: '/decks',
          element: (
            <Suspense fallback={<Loading />}>
              <Decks />
            </Suspense>
          ),
        },
        {
          path: '/decks/edit',
          element: (
            <Suspense fallback={<Loading />}>
              <DeckBuilder />
            </Suspense>
          ),
        },
        {
          path: '/scan',
          element: (
            <Suspense fallback={<Loading />}>
              <Scan />{' '}
            </Suspense>
          ),
        },
        {
          path: '/trade*',
          element: (
            <Suspense fallback={<Loading />}>
              <Trade />
            </Suspense>
          ),
        },
      ],
    },
  ])

  const dialogContextValue = {
    isLoginDialogOpen,
    setIsLoginDialogOpen,
    isProfileDialogOpen,
    setIsProfileDialogOpen,
    selectedCardId,
    setSelectedCardId,
  }

  return (
    <DialogContext.Provider value={dialogContextValue}>
      <ErrorBoundary fallback={errorDiv}>
        <Toaster />
        <RouterProvider router={router} />
        <InstallPrompt />
        <DonationPopup />
        <CardDetail />
        {/* Add React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ErrorBoundary>
    </DialogContext.Provider>
  )
}

export default App
