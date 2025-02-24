import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Definisci il tipo per l'evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation('header')

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    setIsVisible(false)

    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log("Utente ha accettato l'installazione")
        } else {
          console.log("Utente ha rifiutato l'installazione")
        }
        setDeferredPrompt(null)
      })
    }
  }

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        textAlign: 'center',
        justifySelf: 'anchor-center',
        padding: '10px',
        backgroundColor: '#2f2f2fee',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <p>{t('install')}</p>
      <Button onClick={handleInstallClick} variant="default">
        {t('accept')}
      </Button>
      <Button onClick={() => setIsVisible(false)} variant="outline">
        {t('cancel')}
      </Button>
    </div>
  )
}

export default InstallPrompt
