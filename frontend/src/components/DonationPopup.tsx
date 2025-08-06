import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const DONATION_STORAGE_KEY = 'donation_popup'
const EXPIRY_DAYS = 30

const DonationPopup = () => {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Check if the dismissal data exists in localStorage
    const dismissalData = localStorage.getItem(DONATION_STORAGE_KEY)

    if (dismissalData) {
      try {
        const { expireDate } = JSON.parse(dismissalData)
        const now = Date.now()

        // If the expiry date has passed, show the popup
        if (now > expireDate) {
          setShowPopup(true)
        }
      } catch (_error) {
        // If there's an error parsing the JSON, reset and show the popup
        setShowPopup(true)
      }
    } else {
      // If no dismissal data exists, show the popup
      setShowPopup(true)
    }
  }, [])

  const handleDismiss = () => {
    // Calculate expiry date (current time + EXPIRY_DAYS in milliseconds)
    const expireDate = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000

    // Store the dismissal data with expiry date
    localStorage.setItem(
      DONATION_STORAGE_KEY,
      JSON.stringify({
        dismissed: true,
        expireDate,
      }),
    )

    setShowPopup(false)
  }

  if (!showPopup) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        maxWidth: '90%',
        width: '500px',
      }}
      className="border border-neutral-700 p-4 shadow-lg bg-gray-900 rounded-lg"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">Enjoying the site? Your support helps keep it running!</h3>
        <button onClick={handleDismiss} className="text-neutral-400 hover:text-neutral-100" aria-label="Close" type="button">
          <X size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center">
        <p className="mb-4">
          This site is a passion project, and your generous donations cover the costs of hosting and maintenance. Thank you for your consideration!
        </p>
        <Button asChild variant="default">
          <a href="https://buymeacoffee.com/pocketcollectiontracker" target="_blank" rel="noopener noreferrer">
            Donate
          </a>
        </Button>
      </div>
    </div>
  )
}

export default DonationPopup
