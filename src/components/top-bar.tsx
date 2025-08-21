import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, BookOpen, Settings, PenTool, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopBarProps {
  title?: string
  showNavigation?: boolean
}

export function TopBar({ title, showNavigation = true }: TopBarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="flex justify-between items-center mb-12">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <PenTool className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Zeyn
          </span>
        </Link>
        
        {showNavigation && (
          <nav className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className={cn(
                "gap-2 transition-all duration-200 hover:bg-muted/50",
                isActive("/") && "bg-muted text-foreground font-medium"
              )}
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className={cn(
                "gap-2 transition-all duration-200 hover:bg-muted/50",
                isActive("/projects") && "bg-muted text-foreground font-medium"
              )}
            >
              <Link to="/projects">
                <BookOpen className="h-4 w-4" />
                Projects
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className={cn(
                "gap-2 transition-all duration-200 hover:bg-muted/50",
                isActive("/stats") && "bg-muted text-foreground font-medium"
              )}
            >
              <Link to="/stats">
                <TrendingUp className="h-4 w-4" />
                Stats
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className={cn(
                "gap-2 transition-all duration-200 hover:bg-muted/50",
                isActive("/settings") && "bg-muted text-foreground font-medium"
              )}
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        )}
        
        {title && (
          <div className="h-6 w-px bg-border mx-2"></div>
        )}
        
        {title && (
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}