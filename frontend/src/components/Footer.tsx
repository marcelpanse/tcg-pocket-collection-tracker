import { useState } from 'react'
import { LicenseModal } from './LicenseModal'

export default function Footer() {
  const [showLicense, setShowLicense] = useState(false)

  return (
    <>
      <footer className="text-center py-2 bg-[#1a1a1a] text-gray-400 text-xs leading-snug">
        <p className="m-0">
          © 2025 TCG Pocket Collection Tracker.{' '}
          <button
            type="button"
            onClick={() => setShowLicense(true)}
            className="text-blue-500 underline hover:text-blue-600 bg-transparent border-none cursor-pointer p-0"
          >
            License & Disclaimer
          </button>
        </p>
        <p className="m-0 mt-1">
          Not affiliated with Nintendo, Creatures Inc., GAME FREAK Inc., or DeNA Co., Ltd. All trademarks and assets belong to their respective owners.
        </p>
      </footer>

      {showLicense && <LicenseModal onClose={() => setShowLicense(false)} />}
    </>
  )
}
