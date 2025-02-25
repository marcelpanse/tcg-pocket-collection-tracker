import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'

// Define the type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  platforms: string[]
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const showInstall = localStorage.getItem('showInstall')
    return JSON.parse(showInstall || 'false') && true
  })
  const { t } = useTranslation('header')
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

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
    setIsVisible(false)
    localStorage.setItem('showInstall', JSON.stringify(false))

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }

      setDeferredPrompt(null)
    }
  }

  if (!isVisible || !isMobile) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px',
        backgroundColor: '#2f2f2fee',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        justifyItems: 'center',
      }}
    >
      <p>{t('install')}</p>
      <Button onClick={handleInstallClick} type="button" variant="default">
        {t('accept')}
      </Button>
      <Button
        onClick={() => {
          setIsVisible(false)
          localStorage.setItem('showInstall', JSON.stringify(false))
        }}
        type="button"
        variant="outline"
      >
        {t('cancel')}
      </Button>
    </div>
  )
}

export default InstallPrompt
