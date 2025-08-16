import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { GoalsProvider } from '@/contexts/goals-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="zeyn-ui-theme">
      <BrowserRouter>
        <GoalsProvider>
          <App />
        </GoalsProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
