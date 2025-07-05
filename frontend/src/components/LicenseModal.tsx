import { useEffect } from 'react'

export function LicenseModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg mx-4">
        <h2 className="text-xl font-semibold mb-4">License & Legal Disclaimer</h2>
        <p className="text-sm mb-2">
          This project, <strong>TCG Pocket Collection Tracker</strong>, is open source (
          <a
            href="https://https://github.com/marcelpanse/tcg-pocket-collection-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            GitHub repoository
          </a>
          ) and licensed under the{' '}
          <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            GNU General Public License v3.0
          </a>
          . You are free to use, modify, and distribute this software under the terms of such license.
        </p>
        <p className="text-sm mb-2">
          <strong>Disclaimer:</strong> This project is not affiliated with, endorsed by, or sponsored by Nintendo, Creatures Inc., GAME FREAK Inc., or DeNA Co.,
          Ltd. All Pokémon-related assets, names, and trademarks are the property of their respective owners.
        </p>
        <p className="text-sm">All original code and content in this project is © 2025 TCG Pocket Collection Tracker.</p>
      </div>
    </div>
  )
}
