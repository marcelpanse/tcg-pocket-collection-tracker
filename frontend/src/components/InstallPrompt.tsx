import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Define the type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  platforms: string[]
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState<boolean>(() => {
    const showInstall = localStorage.getItem('showInstall')
    return JSON.parse(showInstall || 'true')
  })
  const { t } = useTranslation('header')

  useEffect(() => {
    const handleStorageChange = () => {
      const showInstall = localStorage.getItem('showInstall')
      setShowInstall(JSON.parse(showInstall || 'true'))
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('install clicked', deferredPrompt)
    if (deferredPrompt) {
      console.log('prompting')
      await deferredPrompt.prompt()
      console.log('awaiting user choice')
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowInstall(false)
        localStorage.setItem('showInstall', 'false')
      } else {
        console.log('User dismissed the install prompt')
      }

      setDeferredPrompt(null)
    }
  }

  if (!showInstall || !deferredPrompt) {
    // no deferredPrompt means it can't be installed (e.g. on iOS), so don't show it.
    console.log('not showing install', showInstall, deferredPrompt)
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      className="block sm:hidden border-2 border-slate-600 p-2 shadow-sm bg-gray-900 rounded-md"
    >
      <p className="pb-2">{t('install')}</p>
      <div className="justify-between flex">
        <Button onClick={handleInstallClick} type="button" variant="default">
          {t('accept')}
        </Button>
        <Button
          onClick={() => {
            setShowInstall(false)
            localStorage.setItem('showInstall', 'false')
          }}
          type="button"
          variant="outline"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  )
}

export default InstallPrompt
