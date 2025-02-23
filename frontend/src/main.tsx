import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.tsx'
import './index.css'
import './registerServiceWorker.js'

const root = document.getElementById('root')
if (!root) {
  throw new Error('No root element found!')
}

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <HashRouter>
        <App />
      </HashRouter>
    </Suspense>
  </StrictMode>,
)
