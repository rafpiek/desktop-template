import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { ProjectProvider } from '@/contexts/project-context'
import { GoalsProvider } from '@/contexts/goals-context'
import { GoalProgressProvider } from '@/contexts/goal-progress-context'
import { LastAccessedProvider } from '@/contexts/last-accessed-context'
// Demo data seeder for recording demos
// import { seedDemoData } from '@/infra/seeder'
import { debugCheckStorage } from '@/infra/seeder/debug-check'

// Make debug function available in console
(window as any).debugCheckStorage = debugCheckStorage;

// Uncomment the line below to seed demo data for recording
// seedDemoData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="zeyn-ui-theme">
      <LastAccessedProvider>
        <ProjectProvider>
          <BrowserRouter>
            <GoalsProvider>
              <GoalProgressProvider>
                <App />
              </GoalProgressProvider>
            </GoalsProvider>
          </BrowserRouter>
        </ProjectProvider>
      </LastAccessedProvider>
    </ThemeProvider>
  </StrictMode>,
)
