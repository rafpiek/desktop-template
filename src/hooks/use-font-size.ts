import { useLocalStorage } from './use-local-storage';

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'zen';

export function useFontSize() {
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('editor-font-size', 'md');
  const [lastNonZenSize, setLastNonZenSize] = useLocalStorage<FontSize>('editor-last-non-zen', 'md');

  const toggleZen = (on: boolean) => {
    if (on) {
      if (fontSize !== 'zen') {
        setLastNonZenSize(fontSize);
      }
      setFontSize('zen');
    } else {
      setFontSize(lastNonZenSize ?? 'md');
    }
  };

  const isZen = fontSize === 'zen';

  return { fontSize, setFontSize, isZen, toggleZen };
}
