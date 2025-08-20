import { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { cn } from '@/lib/utils';

export function TauriTitlebar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if we're running in Tauri
    setIsTauri(window.__TAURI__ !== undefined);
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupWindowListener = async () => {
      try {
        const appWindow = getCurrentWindow();
        
        // Check initial state
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);

        // Listen for window state changes
        unlisten = await appWindow.onResized(() => {
          appWindow.isMaximized().then(setIsMaximized);
        });
      } catch (error) {
        console.warn('Failed to setup window listeners:', error);
      }
    };

    setupWindowListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (error) {
      console.error('Failed to toggle maximize:', error);
    }
  };

  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  // Only render in Tauri environment
  if (!isTauri) {
    return null;
  }

  return (
    <div 
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-8 bg-gradient-to-r from-background to-background/95 border-b border-border/20 backdrop-blur-sm select-none"
    >
      {/* Left side - App title */}
      <div className="flex items-center px-4 h-full">
        <h1 className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Zeyn
        </h1>
      </div>

      {/* Center - could be used for breadcrumbs or current document name */}
      <div className="flex-1 flex items-center justify-center px-4">
        {/* Could add current document title here */}
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className={cn(
            "flex items-center justify-center w-12 h-full",
            "hover:bg-muted/50 transition-colors duration-200",
            "focus:outline-none focus:ring-0"
          )}
          title="Minimize"
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <button
          onClick={handleMaximize}
          className={cn(
            "flex items-center justify-center w-12 h-full",
            "hover:bg-muted/50 transition-colors duration-200",
            "focus:outline-none focus:ring-0"
          )}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Square className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </button>
        
        <button
          onClick={handleClose}
          className={cn(
            "flex items-center justify-center w-12 h-full",
            "hover:bg-red-500/90 hover:text-white transition-colors duration-200",
            "focus:outline-none focus:ring-0"
          )}
          title="Close"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}