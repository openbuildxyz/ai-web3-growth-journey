import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Debug: Log environment variables in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Variables:', {
    VITE_CLERK_PUBLISHABLE_KEY: PUBLISHABLE_KEY ? '✅ Loaded' : '❌ Missing',
    VITE_API_URL: import.meta.env.VITE_API_URL || '❌ Missing',
    NODE_ENV: import.meta.env.NODE_ENV
  });
}

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
)
