import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'

// Type for debug window extensions
interface DebugWindow extends Window {
  debugCheckStorage?: () => void;
}

// Make debug utilities available in development
if (process.env.NODE_ENV === 'development') {
  // Could add debug utilities here if needed
  (window as DebugWindow).debugCheckStorage = () => {
    console.log('localStorage:', localStorage);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="desktop-template-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
