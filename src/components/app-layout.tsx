import { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"
import { TauriTitlebar } from "@/components/tauri-titlebar"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showNavigation?: boolean
  maxWidth?: "default" | "wide" | "full"
}

export function AppLayout({ 
  children, 
  title, 
  showNavigation = true,
  maxWidth = "default"
}: AppLayoutProps) {
  const containerClasses = {
    default: "container mx-auto px-4 py-8",
    wide: "container mx-auto px-4 py-8 max-w-7xl",
    full: "mx-auto px-4 py-8"
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Custom Tauri Title Bar */}
      <TauriTitlebar />
      
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/3 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>
      
      {/* Main content area with title bar spacing */}
      <div className={cn(containerClasses[maxWidth], "relative z-10 pt-8")}>
        <TopBar title={title} showNavigation={showNavigation} />
        <main className="animate-in fade-in duration-700">{children}</main>
      </div>
    </div>
  )
}