import { ReactNode } from "react"
import { TopBar } from "@/components/top-bar"

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
    <div className="min-h-screen bg-background text-foreground">
      <div className={containerClasses[maxWidth]}>
        <TopBar title={title} showNavigation={showNavigation} />
        <main>{children}</main>
      </div>
    </div>
  )
}