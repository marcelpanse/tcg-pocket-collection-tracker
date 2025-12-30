import { lazy } from '@loadable/component'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Suspense, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createHashRouter, Navigate, Outlet, RouterProvider, useLocation, useParams } from 'react-router'
import DonationPopup from '@/components/DonationPopup.tsx'
import InstallPrompt from '@/components/InstallPrompt.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { useAuthSSO, useUser } from '@/services/auth/useAuth'
import ErrorAlert from './components/ErrorAlert.tsx'
import { Header } from './components/Header.tsx'
import { Spinner } from './components/Spinner.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { DialogContext } from './context/DialogContext.ts'

// Lazy import for chunking
const Overview = lazy(() => import('./pages/overview/Overview.tsx'))
const Collection = lazy(() => import('./pages/collection/Collection.tsx'))
const Missions = lazy(() => import('./pages/collection/Missions.tsx'))
const Decks = lazy(() => import('./pages/decks/Decks.tsx'))
const DeckBuilder = lazy(() => import('./pages/decks/DeckBuilder.tsx'))
const Trade = lazy(() => import('./pages/trade/Trade.tsx'))
const Scan = lazy(() => import('./pages/scan/Scan.tsx'))
const EditProfile = lazy(() => import('./components/EditProfile.tsx'))
const CardDetail = lazy(() => import('./pages/collection/CardDetail.tsx'))

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

  const router = createHashRouter([
    {
      element: (
        <>
          <Analytics />
          <Header />
          <ErrorBoundary FallbackComponent={ErrorAlert}>
            <Suspense fallback={<Spinner size="lg" overlay />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
          <EditProfile />
        </>
      ),
      errorElement: <ErrorAlert />,
      children: [
        { path: '/', element: <Overview /> },
        { path: '/collection/missions', element: <Missions /> },
        { path: '/collection/:friendId?', element: <Collection /> },
        { path: '/collection/:friendId/trade', element: <TradeWithRedirect /> }, // support old trading path
        { path: '/decks', element: <Decks /> },
        { path: '/decks/edit/:id?', element: <DeckBuilder /> },
        { path: '/scan', element: <Scan /> },
        { path: '/trade/*', element: <Trade /> },
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
    <ErrorBoundary FallbackComponent={ErrorAlert}>
      <DialogContext.Provider value={dialogContextValue}>
        <Toaster />
        <RouterProvider router={router} />
        <InstallPrompt />
        <DonationPopup />
        <ErrorBoundary fallback={null} onError={() => toast({ variant: 'destructive', description: 'Failed opening card details.' })}>
          <CardDetail />
        </ErrorBoundary>
        {/* Add React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </DialogContext.Provider>
    </ErrorBoundary>
  )
}

export default App
