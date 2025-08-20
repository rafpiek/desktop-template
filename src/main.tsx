import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { ProjectProvider } from '@/contexts/project-context'
import { GoalsProvider } from '@/contexts/goals-context'
import { LastAccessedProvider } from '@/contexts/last-accessed-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="zeyn-ui-theme">
      <LastAccessedProvider>
        <ProjectProvider>
          <BrowserRouter>
            <GoalsProvider>
              <App />
            </GoalsProvider>
          </BrowserRouter>
        </ProjectProvider>
      </LastAccessedProvider>
    </ThemeProvider>
  </StrictMode>,
)
