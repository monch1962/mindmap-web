import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'
import { trackWebVitals } from './utils/performance'

// Initialize Web Vitals tracking
if (import.meta.env.DEV) {
  onCLS(trackWebVitals)
  onFCP(trackWebVitals)
  onLCP(trackWebVitals)
  onTTFB(trackWebVitals)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope)
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error)
      })
  })
}
