import loadable from '@loadable/component'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useMemo, useState } from 'react'
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
const Overview = loadable(() => import('./pages/overview/Overview.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Decks = loadable(() => import('./pages/decks/Decks.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))
const TradeWith = loadable(() => import('./pages/trade/TradeWith.tsx'))
const EditProfile = loadable(() => import('./components/EditProfile.tsx'))
const CardDetail = loadable(() => import('./pages/collection/CardDetail.tsx'))

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
  const [selectedCardId, setSelectedCardId] = useState('')

  // Check for SSO parameters
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search)
      const sso = params.get('sso')
      const sig = params.get('sig')
      if (sso && sig) {
        toast({ title: 'Logging in', description: 'Please wait...', variant: 'default' })

        authSSOQuery.mutate({ user, sso, sig })
      }
    }
  }, [user, toast, authSSOQuery])

  const errorDiv = <div className="m-4">A new version was deployed, please refresh the page to see the latest changes.</div>

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
        { path: '/', element: <Overview /> },
        { path: '/collection/:friendId?', element: <Collection /> },
        { path: '/decks', element: <Decks /> },
        { path: '/trade', element: <Trade /> },
        { path: '/trade/:friendId', element: <TradeWith /> },
        { path: '/collection/:friendId/trade', element: <TradeWithRedirect /> }, // support old trading path
      ],
    },
  ])

  const dialogContextValue = useMemo(
    () => ({
      isLoginDialogOpen,
      setIsLoginDialogOpen,
      isProfileDialogOpen,
      setIsProfileDialogOpen,
      selectedCardId,
      setSelectedCardId,
    }),
    [isLoginDialogOpen, isProfileDialogOpen, selectedCardId],
  )

  return (
    <DialogContext.Provider value={dialogContextValue}>
      <ErrorBoundary fallback={errorDiv}>
        <Toaster />
        <RouterProvider router={router} />
        <InstallPrompt />
        <DonationPopup />
        {selectedCardId && <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />}
        {/* Add React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ErrorBoundary>
    </DialogContext.Provider>
  )
}

export default App
