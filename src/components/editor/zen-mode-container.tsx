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
    console.log('🌀 Created zen mode portal container');

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
        console.log('🗑️ Removed zen mode portal container');
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

  // Focus management and fullscreen attempt when zen mode is activated
  React.useEffect(() => {
    if (!isZenMode) return;

    // Focus the editor content when entering zen mode
    const focusEditor = () => {
      const editorElement = document.querySelector('[data-slate-editor]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
        console.log('🎯 Focused editor in zen mode');
      } else {
        console.warn('⚠️ Could not find editor element to focus');
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
          
          console.log('✅ Successfully entered browser fullscreen');
        } catch (error) {
          console.warn('⚠️ Fullscreen request failed, using fallback overlay:', error);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to exit zen mode
      if (event.key === 'Escape' && isZenMode) {
        event.preventDefault();
        event.stopPropagation();
        console.log('⌨️ Escape pressed, exiting zen mode');
        onToggleZenMode();
        return;
      }

      // F11 handling for web (prevent browser fullscreen conflict)
      if (event.key === 'F11' && !isTauriApp) {
        event.preventDefault();
        if (!isZenMode) {
          onToggleZenMode();
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

  console.log('🧘 Zen mode is active, rendering zen content');
  console.log('🌀 Portal container:', portalContainer);
  console.log('🖥️ Is Tauri app:', isTauriApp);

  // If no portal container yet, don't render
  if (!portalContainer) {
    console.log('⚠️ No portal container available yet');
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
    console.log('🖥️ Rendering zen content directly for Tauri');
    return zenContent;
  }

  // For web, use portal
  console.log('🌐 Creating portal for web zen mode');
  return createPortal(zenContent, portalContainer);
}