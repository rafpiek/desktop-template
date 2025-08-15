import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { cn } from '@/lib/utils';

interface ZenModeContainerProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ZenModeContainer({ 
  isZenMode, 
  onToggleZenMode, 
  children, 
  className 
}: ZenModeContainerProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);
  const [isInBrowserFullscreen, setIsInBrowserFullscreen] = useState(false);
  const isTauriApp = useIsTauri();
  const fullscreenElementRef = useRef<HTMLDivElement>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'zen-mode-portal';
    container.className = 'zen-mode-portal';
    document.body.appendChild(container);
    setPortalContainer(container);

    // Check if fullscreen API is supported
    setIsFullscreenSupported(
      'requestFullscreen' in document.documentElement ||
      'webkitRequestFullscreen' in document.documentElement ||
      'msRequestFullscreen' in document.documentElement ||
      'mozRequestFullScreen' in document.documentElement
    );

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      
      setIsInBrowserFullscreen(isCurrentlyFullscreen);
      
      // If user exits fullscreen via browser controls, update zen mode state
      if (!isCurrentlyFullscreen && isZenMode && !isTauriApp) {
        console.log('🚪 Exiting zen mode due to fullscreen exit');
        onToggleZenMode();
      }
    };

    // Listen for fullscreen change events (with vendor prefixes)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [isZenMode, onToggleZenMode, isTauriApp]);

  // Handle zen mode toggle with fullscreen API
  const handleZenModeToggle = async () => {
    if (!isTauriApp && isFullscreenSupported && fullscreenElementRef.current) {
      if (!isZenMode) {
        // Entering zen mode - request fullscreen
        try {
          const element = fullscreenElementRef.current;
          
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen();
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen();
          }
          
          console.log('✅ Successfully entered browser fullscreen');
        } catch (error) {
          console.warn('⚠️ Fullscreen request failed, using fallback overlay:', error);
          // Fallback to overlay mode
          onToggleZenMode();
          return;
        }
      } else {
        // Exiting zen mode - exit fullscreen
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          }
          
          console.log('✅ Successfully exited browser fullscreen');
        } catch (error) {
          console.warn('⚠️ Fullscreen exit failed:', error);
        }
      }
    } else {
      // Tauri app or no fullscreen support - use regular toggle
      onToggleZenMode();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to exit zen mode
      if (event.key === 'Escape' && isZenMode) {
        event.preventDefault();
        event.stopPropagation();
        console.log('⌨️ Escape pressed, exiting zen mode');
        
        if (isTauriApp) {
          // Let the parent handle Tauri fullscreen exit
          onToggleZenMode();
        } else {
          // Handle browser fullscreen exit
          handleZenModeToggle();
        }
        return;
      }

      // F11 handling for web (prevent browser fullscreen conflict)
      if (event.key === 'F11' && !isTauriApp) {
        event.preventDefault();
        if (!isZenMode) {
          handleZenModeToggle();
        }
        return;
      }
    };

    if (isZenMode) {
      // Add listener with high priority when in zen mode
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isZenMode, isTauriApp, onToggleZenMode]);

  // If not in zen mode, render children normally
  if (!isZenMode) {
    return <>{children}</>;
  }

  // If no portal container yet, don't render
  if (!portalContainer) {
    return null;
  }

  // Determine if we should use fullscreen API or overlay fallback
  const useFullscreenAPI = !isTauriApp && isFullscreenSupported;
  const shouldShowOverlay = !useFullscreenAPI || !isInBrowserFullscreen;

  const zenContent = (
    <div
      ref={fullscreenElementRef}
      className={cn(
        // Base fullscreen styles
        'zen-mode-container',
        // Conditional overlay styles for fallback
        shouldShowOverlay && [
          'fixed inset-0 z-[9999]',
          'bg-background',
          'overflow-hidden'
        ],
        // Fullscreen API styles
        useFullscreenAPI && [
          'h-screen w-screen',
          'bg-background'
        ],
        className
      )}
      style={{
        // Ensure we cover the entire screen
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      {children}
    </div>
  );

  // For Tauri, render directly (Tauri handles native fullscreen)
  if (isTauriApp) {
    return zenContent;
  }

  // For web, use portal
  return createPortal(zenContent, portalContainer);
}