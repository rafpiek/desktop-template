import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, BookOpen, FileEdit, Settings } from "lucide-react"

interface TopBarProps {
  title?: string
  showNavigation?: boolean
}

export function TopBar({ title, showNavigation = true }: TopBarProps) {
  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-6">
        {showNavigation && (
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/editor" className="gap-2">
                <FileEdit className="h-4 w-4" />
                Editor
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Projects
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        )}
        {title && (
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        )}
      </div>
      <ThemeToggle />
    </header>
  )
}