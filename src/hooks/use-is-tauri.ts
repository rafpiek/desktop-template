'use client';

import * as React from 'react';

export function useIsTauri() {
  const [isTauri, setIsTauri] = React.useState(false);

  React.useEffect(() => {
    // Check if running in Tauri v2 with multiple detection methods
    const checkTauri = async () => {
      // Method 1: Check for Tauri internals (most reliable)
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        return true;
      }

      // Method 2: Check for Tauri metadata
      if (typeof window !== 'undefined' && (window as any).__TAURI_METADATA__) {
        return true;
      }

      // Method 3: Try to import Tauri API
      try {
        await import('@tauri-apps/api/app');
        return true;
      } catch (error) {
        // Method 4: Check user agent for Tauri
        if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Tauri')) {
          return true;
        }

        return false;
      }
    };

    checkTauri().then(setIsTauri);
  }, []);

  return isTauri;
}
