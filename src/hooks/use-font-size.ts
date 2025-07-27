import { createContext, useContext } from 'react';

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'zen';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

export const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }

  console.log('useFontSize hook - fontSize:', context.fontSize);

  return context;
}
