export function LicenseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full overflow-y-auto max-h-[80vh] leading-relaxed">
        <h2 className="text-xl font-semibold mb-4">License & Legal Disclaimer</h2>
        <p className="text-sm mb-2">
          This project, <strong>TCG Pocket Collection Tracker</strong>, is open source and licensed under the{' '}
          <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            GNU General Public License v3.0
          </a>
          . You are free to use, modify, and distribute this software under the terms of that license, as long as you also share your changes under the same
          license.
        </p>
        <p className="text-sm mb-2">
          <strong>Disclaimer:</strong> This project is not affiliated with, endorsed by, or sponsored by Nintendo, Creatures Inc., GAME FREAK Inc., or DeNA Co.,
          Ltd. All Pokémon-related assets, names, and trademarks are the property of their respective owners.
        </p>
        <p className="text-sm">All original code and content in this project is © 2025 TCG Pocket Collection Tracker.</p>
        <button type="button" onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  )
}
