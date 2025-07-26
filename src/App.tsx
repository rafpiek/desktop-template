import { Routes, Route, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Editor from "./pages/Editor"

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-end mb-8">
          <ThemeToggle />
        </header>
        
        <main className="space-y-12">
          <section className="text-center space-y-6">
            <h1 className="text-6xl font-bold tracking-tight">
              Zeyn
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hello. So, dear user, welcome to Zeyn, the best editor for writers ever.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">✍️</span>
                  Write
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Distraction-free writing environment designed for focus and creativity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Writing
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">📝</span>
                  Edit
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Powerful editing tools to refine and perfect your prose
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/editor">
                  <Button className="w-full" variant="outline">
                    Open Editor
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">📚</span>
                  Organize
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Manage your projects, chapters, and ideas in one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Projects
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="text-center pt-8">
            <Button size="lg" className="px-8 py-6 text-lg">
              Get Started Today
            </Button>
          </section>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  )
}

export default App
