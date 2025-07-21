import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export function LicenseModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('footer')

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
      <div className="bg-gray-200 text-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-4">{t('modal.title')}</h2>

        <p className="text-sm mb-3">
          <Trans
            i18nKey="modal.licenseSummary"
            t={t}
            values={{ projectName: 'TCG Pocket Collection Tracker' }}
            components={{
              repo: (
                <a
                  href="https://github.com/marcelpanse/tcg-pocket-collection-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600"
                >
                  GitHub repository
                </a>
              ),
            }}
          />
        </p>

        <p className="font-semibold">{t('modal.disclaimerTitle')}</p>
        <p className="text-sm mb-2 whitespace-pre-line">{t('modal.disclaimerText')}</p>
        <p className="text-sm">{t('modal.copyright', { projectName: 'TCG Pocket Collection Tracker' })}</p>
      </div>
    </div>
  )
}
