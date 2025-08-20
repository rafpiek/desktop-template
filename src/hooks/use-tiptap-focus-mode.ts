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

  const [isActive, setIsActive] = useState(false);

  const toggleFocusMode = useCallback(() => {
    const newMode = settings.mode === 'off' ? 'paragraph' : 'off';
    setSettings({
      ...settings,
      mode: newMode,
    });
    setIsActive(newMode !== 'off');
    console.log(`🎯 TipTap Focus: Toggled focus mode to ${newMode}`);
  }, [settings, setSettings]);

  const setFocusMode = useCallback((mode: TiptapFocusMode) => {
    setSettings({
      ...settings,
      mode,
    });
    setIsActive(mode !== 'off');
    console.log(`🎯 TipTap Focus: Set focus mode to ${mode}`);
  }, [settings, setSettings]);

  const setDimOpacity = useCallback((opacity: number) => {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    setSettings({
      ...settings,
      dimOpacity: clampedOpacity,
    });
    console.log(`🎯 TipTap Focus: Set dim opacity to ${clampedOpacity}`);
  }, [settings, setSettings]);

  // Integration with existing typewriter hook
  const focusMode = settings.mode !== 'off';
  
  return {
    settings,
    focusMode,
    isActive,
    toggleFocusMode,
    setFocusMode,
    setDimOpacity,
  };
}