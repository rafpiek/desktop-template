import { Routes, Route, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/app-layout"
import ProjectsPage from "./pages/projects"
import SettingsPage from "./pages/settings"
import GoalsPage from "./pages/goals"
import { ProjectLayout } from "./components/project/project-layout"
import { ProjectOverviewWrapper } from "./components/project/project-overview-wrapper"
import { DocumentView } from "./components/project/document-view"
import { ChapterOverview } from "./components/project/chapter-overview"
import { ChaptersOverview } from "./components/project/chapters-overview"
import { DraftsOverview } from "./components/project/drafts-overview"
import { ContinueOnSection } from "./components/continue-on-section"
import { BookOpen, Settings, Target, Sparkles, ArrowRight, PenTool, TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLastAccessed } from "./contexts/last-accessed-context"

function HomePage() {
  const { lastAccessed } = useLastAccessed();
  const hasRecentWork = lastAccessed.project || lastAccessed.chapter || lastAccessed.document;
  
  // Check localStorage for user data
  const projects = JSON.parse(localStorage.getItem('zeyn-projects') || '[]');
  const hasProjects = projects.length > 0;
  const totalWords = projects.reduce((sum: number, p: any) => sum + (p.wordCount || 0), 0);

  return (
    <AppLayout showNavigation={true}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Recent Work - Only show if exists */}
        {hasRecentWork && (
          <div className="mb-8">
            <ContinueOnSection />
          </div>
        )}

        {/* Main Navigation - Compact Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Projects */}
          <Link to="/projects" className="group">
            <Card className="h-full border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  {hasProjects && (
                    <div className="text-sm font-medium text-muted-foreground">
                      {projects.length} active
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300">
                  Projects
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {hasProjects ? 'Manage your writing projects' : 'Start your first project'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-blue-600 transition-colors duration-300">
                  <span>{hasProjects ? 'View projects' : 'Get started'}</span>
                  <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Goals */}
          <Link to="/goals" className="group">
            <Card className="h-full border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-emerald-500" />
                  </div>
                  {totalWords > 0 && (
                    <div className="text-sm font-medium text-muted-foreground">
                      {totalWords.toLocaleString()} words
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-emerald-600 transition-colors duration-300">
                  Goals
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Track your daily writing progress
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-emerald-600 transition-colors duration-300">
                  <span>Set targets</span>
                  <TrendingUp className="h-4 w-4 ml-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings */}
          <Link to="/settings" className="group">
            <Card className="h-full border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors duration-300">
                  Settings
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Customize your writing environment
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-purple-600 transition-colors duration-300">
                  <span>Preferences</span>
                  <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* New user CTA - Only show if no projects */}
        {!hasProjects && (
          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">Ready to begin your writing journey?</p>
            <Link to="/projects">
              <Button className="px-6 py-2 bg-primary hover:bg-primary/90 transition-colors duration-300">
                Create Your First Project
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      <Route path="/projects/:id" element={<ProjectLayout />}>
        <Route index element={<ProjectOverviewWrapper />} />
        <Route path="chapters" element={<ChaptersOverview />} />
        <Route path="chapters/:chapterId" element={<ChapterOverview />} />
        <Route path="chapters/:chapterId/documents/:documentId" element={<DocumentView />} />
        <Route path="drafts" element={<DraftsOverview />} />
        <Route path="drafts/:draftId" element={<DocumentView />} />
      </Route>
    </Routes>
  )
}

export default App
