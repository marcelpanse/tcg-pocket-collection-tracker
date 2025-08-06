import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LicenseModal } from './LicenseModal'

export default function Footer() {
  const [showLicense, setShowLicense] = useState(false)
  const { t } = useTranslation('footer')

  return (
    <>
      <footer className="text-center py-4 mx-2 text-gray-300 text-xs leading-snug">
        <p className="m-1">
          © 2025 TCG Pocket Collection Tracker.{' '}
          <button type="button" onClick={() => setShowLicense(true)} className="text-blue-300 underline hover:text-blue-500 cursor-pointer">
            {t('licenseDisclaimer')}
          </button>
        </p>
        <p className="text-gray-400 mx-4 mb-1 whitespace-pre-line text-center text-xs">
          {/* Bottom spacing accounts for navbar when installed as app */}
          {t('notAffiliated')}
        </p>
      </footer>

      {showLicense && <LicenseModal onClose={() => setShowLicense(false)} />}
    </>
  )
}
