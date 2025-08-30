import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import App from './App.tsx'
import i18n from './i18n.tsx'
import './index.css'
import './registerServiceWorker.js'

const root = document.getElementById('root')
if (!root) {
  throw new Error('No root element found!')
}

createRoot(root).render(
  <Suspense fallback={<div />}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Suspense>,
)
