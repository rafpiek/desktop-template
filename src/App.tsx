import { Routes, Route, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import AboutPage from "./pages/about"
import EditorPage from "./pages/editor"
import SettingsPage from "./pages/settings"
import StatsPage from "./pages/stats"
import { 
  BookOpen, 
  Settings, 
  BarChart3, 
  ArrowRight, 
  Info, 
  Edit,
  Sparkles,
  Zap,
  Shield
} from "lucide-react"

function HomePage() {
  return (
    <AppLayout showNavigation={true}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
            <Sparkles className="w-4 h-4" />
            Desktop Template
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Desktop App</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern template built with React, Tauri, TypeScript, and Tailwind CSS. 
            Everything you need to build beautiful desktop applications.
          </p>
        </div>

        {/* Main Navigation - 4 Card Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* About */}
          <Link to="/about" className="group">
            <Card className="h-full border-2 border-border/20 bg-gradient-to-br from-card to-card/50 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ring-1 ring-border/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">
                  About
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Learn about this template and its features
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-blue-600 transition-colors duration-300">
                  <span>Template info</span>
                  <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Editor */}
          <Link to="/editor" className="group">
            <Card className="h-full border-2 border-border/20 bg-gradient-to-br from-card to-card/50 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ring-1 ring-border/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <Edit className="h-5 w-5 text-green-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Tiptap</Badge>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-green-600 transition-colors duration-300">
                  Editor
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Rich text editor powered by Tiptap
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-green-600 transition-colors duration-300">
                  <span>Try editor</span>
                  <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Stats */}
          <Link to="/stats" className="group">
            <Card className="h-full border-2 border-border/20 bg-gradient-to-br from-card to-card/50 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ring-1 ring-border/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Charts</Badge>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-emerald-600 transition-colors duration-300">
                  Stats
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Data visualization with charts
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-emerald-600 transition-colors duration-300">
                  <span>View charts</span>
                  <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings */}
          <Link to="/settings" className="group">
            <Card className="h-full border-2 border-border/20 bg-gradient-to-br from-card to-card/50 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ring-1 ring-border/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-purple-600 transition-colors duration-300">
                  Settings
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Configure app preferences and theme
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

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Fast & Modern</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built with the latest React 19, TypeScript, and Vite for optimal performance and developer experience.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Cross Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Powered by Tauri for native desktop performance on Windows, macOS, and Linux.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Ready to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete with routing, theming, components, and example pages to get you started quickly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
    </Routes>
  )
}

export default App
