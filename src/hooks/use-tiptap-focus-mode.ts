import { useState, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

export type TiptapFocusMode = 'off' | 'sentence' | 'paragraph' | 'typewriter';

export interface TiptapFocusModeSettings {
  mode: TiptapFocusMode;
  dimOpacity: number;
}

const STORAGE_KEY = 'tiptap-focus-mode-settings';

const defaultSettings: TiptapFocusModeSettings = {
  mode: 'off',
  dimOpacity: 0.3,
};

export function useTiptapFocusMode() {
  const [settings, setSettings] = useLocalStorage<TiptapFocusModeSettings>(
    STORAGE_KEY,
    defaultSettings
  );

  const toggleFocusMode = useCallback(() => {
    setSettings((prevSettings) => {
      const newMode = prevSettings.mode === 'off' ? 'paragraph' : 'off';
      return {
        ...prevSettings,
        mode: newMode,
      };
    });
  }, [setSettings]);

  const setFocusMode = useCallback((mode: TiptapFocusMode) => {
    setSettings((prevSettings) => {
      return {
        ...prevSettings,
        mode,
      };
    });
  }, [setSettings]);

  const setDimOpacity = useCallback((opacity: number) => {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    setSettings((prevSettings) => {
      return {
        ...prevSettings,
        dimOpacity: clampedOpacity,
      };
    });
  }, [setSettings]);

  // Integration with existing typewriter hook
  const focusMode = settings.mode !== 'off';
  const isActive = focusMode; // Derived from settings, no separate state needed
  
  return {
    settings,
    focusMode,
    isActive,
    toggleFocusMode,
    setFocusMode,
    setDimOpacity,
  };
}