import { type Editor } from '@tiptap/react';

/**
 * Tauri Focus Manager - Handles the specific focus issues on macOS Tauri
 * Based on research of known Tauri limitations with webview focus
 */

// Check if we're running in Tauri environment
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__;
}

// Check if we're on macOS (where the focus issues are most prominent)
export function isMacOS(): boolean {
  return typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');
}

/**
 * Ensures the Tauri window has focus before editor operations
 * This addresses the known issue where macOS webview doesn't auto-focus
 */
export async function ensureTauriWindowFocus(): Promise<boolean> {
  if (!isTauriEnvironment()) {
    return true; // Not Tauri, no action needed
  }

  try {
    const { Window } = await import('@tauri-apps/api/window');
    const currentWindow = Window.getCurrent();
    
    // Check if window is focused
    const isFocused = await currentWindow.isFocused();
    
    if (!isFocused) {
      // Try to focus the window
      await currentWindow.setFocus();
      
      // Wait a bit for focus to take effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify focus was set
      return await currentWindow.isFocused();
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Waits for the webview to be properly focused and ready for editor operations
 * This is crucial for Tauri on macOS where focus is delayed
 */
export async function waitForWebviewReady(maxWaitMs: number = 2000): Promise<boolean> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const checkReady = () => {
      // Check if document has focus
      if (document.hasFocus()) {
        resolve(true);
        return;
      }
      
      // Check if we've exceeded max wait time
      if (Date.now() - startTime > maxWaitMs) {
        resolve(false);
        return;
      }
      
      // Try again after a short delay
      setTimeout(checkReady, 50);
    };
    
    checkReady();
  });
}

/**
 * Comprehensive Tauri-safe editor initialization
 * Handles the full sequence needed for proper editor startup in Tauri
 */
export async function initializeTauriEditor(editor: Editor | null): Promise<boolean> {
  if (!editor || editor.isDestroyed) {
    return false;
  }
  
  // If not Tauri, proceed normally
  if (!isTauriEnvironment()) {
    return true;
  }
  
  try {
    // Step 1: Ensure Tauri window has focus
    const windowFocused = await ensureTauriWindowFocus();
    if (!windowFocused) {
      console.warn('Failed to focus Tauri window');
    }
    
    // Step 2: Wait for webview to be ready
    const webviewReady = await waitForWebviewReady(3000);
    if (!webviewReady) {
      console.warn('Webview not ready after timeout');
    }
    
    // Step 3: Additional delay for macOS if needed
    if (isMacOS()) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Step 4: Verify editor view is accessible
    let viewReady = false;
    for (let i = 0; i < 10; i++) {
      try {
        if (editor.view && editor.view.dom && typeof editor.view.hasFocus === 'function') {
          // Try to access hasFocus to ensure it works
          editor.view.hasFocus;
          viewReady = true;
          break;
        }
      } catch {
        // View not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return viewReady;
  } catch (error) {
    console.error('Tauri editor initialization failed:', error);
    return false;
  }
}

/**
 * Safe editor focus that handles Tauri-specific issues
 */
export async function safeTauriFocus(editor: Editor | null): Promise<boolean> {
  if (!editor || editor.isDestroyed) {
    return false;
  }
  
  try {
    // Initialize Tauri environment if needed
    const initialized = await initializeTauriEditor(editor);
    if (!initialized) {
      return false;
    }
    
    // Now try to focus the editor
    if (editor.view && editor.view.dom && typeof editor.view.hasFocus === 'function') {
      editor.commands.focus();
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Click handler that ensures proper focus in Tauri environment
 * Addresses the "first click doesn't propagate" issue
 */
export function createTauriClickHandler(originalHandler?: () => void) {
  return async () => {
    if (isTauriEnvironment()) {
      // Ensure window focus first
      await ensureTauriWindowFocus();
      
      // Small delay to let focus settle
      setTimeout(() => {
        if (originalHandler) {
          originalHandler();
        }
      }, 50);
    } else {
      if (originalHandler) {
        originalHandler();
      }
    }
  };
}