import { useLocalStorage } from '@/hooks/use-local-storage';

export type TypewriterMode = 'off' | 'center';
export type TypewriterOffset = 'center' | 'offset';

export interface TypewriterSettings {
  mode: TypewriterMode;
  offset: TypewriterOffset;
}

const STORAGE_KEY = 'typewriter-settings';

const initialSettings: TypewriterSettings = {
  mode: 'center',
  offset: 'offset',
};

export function useTypewriter() {
  const [settings, setSettings] = useLocalStorage<TypewriterSettings>(
    STORAGE_KEY,
    initialSettings
  );

  return [settings, setSettings] as const;
}
