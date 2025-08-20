'use client';

import { useState, useEffect } from 'react';
import { type TypewriterMode, type TypewriterSettings } from './use-typewriter';

const STORAGE_KEY = 'typewriter-settings';

export function useTiptapTypewriter() {
  const [mode, setMode] = useState<TypewriterMode>('off');
  
  // Load initial settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const settings: TypewriterSettings = JSON.parse(stored);
          setMode(settings.mode);
        }
      } catch (error) {
        setMode('off');
      }
    };

    loadSettings();
  }, []);

  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const settings: TypewriterSettings = JSON.parse(e.newValue);
          setMode(settings.mode);
        } catch (error) {
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for manual settings changes within the same tab
  useEffect(() => {
    const handleCustomEvent = () => {
      // Re-read from storage when settings change
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const settings: TypewriterSettings = JSON.parse(stored);
          setMode(settings.mode);
        }
      } catch (error) {
      }
    };

    // Listen for settings dialog changes
    window.addEventListener('tiptap-typewriter-change', handleCustomEvent);
    return () => window.removeEventListener('tiptap-typewriter-change', handleCustomEvent);
  }, []);

  return { mode };
}

// Helper function to trigger typewriter settings update
export const triggerTiptapTypewriterUpdate = () => {
  const event = new CustomEvent('tiptap-typewriter-change');
  window.dispatchEvent(event);
};