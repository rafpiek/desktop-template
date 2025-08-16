import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Edit, Wrench, FolderOpen, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsLayoutProps {
  children: ReactNode
}

interface SettingsNavItem {
  id: string
  label: string
  icon: React.ElementType
  path: string
}

const settingsNavItems: SettingsNavItem[] = [
  {
    id: "general",
    label: "General",
    icon: Settings,
    path: "/settings/general"
  },
  {
    id: "backup",
    label: "Backup",
    icon: FolderOpen,
    path: "/settings/backup"
  },
  {
    id: "editor",
    label: "Editor", 
    icon: Edit,
    path: "/settings/editor"
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: Wrench,
    path: "/settings/advanced"
  }
]

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation()
  
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <div className="w-64 bg-muted/30 rounded-lg p-4 flex flex-col">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild className="justify-start p-2">
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        
        <Separator className="mb-4" />
        
        {/* Settings navigation */}
        <nav className="space-y-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "w-full justify-start p-3 h-auto",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Link to={item.path} className="gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 bg-background rounded-lg border p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}