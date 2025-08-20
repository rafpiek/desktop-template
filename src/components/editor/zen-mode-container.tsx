import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { cn } from '@/lib/utils';

interface ZenModeContainerProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
  children: React.ReactNode;
  className?: string;
  onPortalContainerReady?: (container: HTMLElement | null) => void;
}

export function ZenModeContainer({ 
  isZenMode, 
  onToggleZenMode, 
  children, 
  className,
  onPortalContainerReady
}: ZenModeContainerProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);
  const [, setIsInBrowserFullscreen] = useState(false);
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

  // Notify parent component when portal container is ready or zen mode changes
  useEffect(() => {
    if (onPortalContainerReady) {
      // Pass the portal container when zen mode is active, null otherwise
      onPortalContainerReady(isZenMode ? portalContainer : null);
    }
  }, [portalContainer, isZenMode, onPortalContainerReady]);

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
      
      // If user exits fullscreen via browser controls, keep zen mode active
      // (they need to use Cmd/Ctrl+Shift+F or button to exit zen mode)
      if (!isCurrentlyFullscreen && isZenMode && !isTauriApp) {
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

  // Focus management and fullscreen attempt when zen mode is activated
  React.useEffect(() => {
    if (!isZenMode) return;

    // Focus the editor content when entering zen mode
    const focusEditor = () => {
      const editorElement = document.querySelector('[data-slate-editor]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
      } else {
      }
    };

    // Small delay to ensure DOM is ready
    const focusTimeout = setTimeout(focusEditor, 200);

    // Try fullscreen if supported (but don't rely on it)
    if (!isTauriApp && isFullscreenSupported && fullscreenElementRef.current) {
      const tryFullscreen = async () => {
        try {
          const element = fullscreenElementRef.current!;
          
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen();
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen();
          }
          
        } catch (error) {
        }
      };

      const fullscreenTimeout = setTimeout(tryFullscreen, 100);
      return () => {
        clearTimeout(focusTimeout);
        clearTimeout(fullscreenTimeout);
      };
    }

    return () => clearTimeout(focusTimeout);
  }, [isZenMode, isTauriApp, isFullscreenSupported]);

  // Note: Escape key intentionally does NOT exit zen mode
  // to prevent accidental exits when using Escape for other editor functions
  // Use Cmd/Ctrl+Shift+F or the button to exit zen mode

  // If not in zen mode, render children normally
  if (!isZenMode) {
    return <>{children}</>;
  }


  // If no portal container yet, don't render
  if (!portalContainer) {
    return null;
  }

  // Always use overlay fallback for now (Fullscreen API is unreliable)
  const zenContent = (
    <div
      ref={fullscreenElementRef}
      className={cn(
        'zen-mode-container',
        'fixed inset-0 z-[9999]',
        'bg-background text-foreground',
        'overflow-auto',
        className
      )}
      style={{
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