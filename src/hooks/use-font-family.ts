import { createContext, useContext } from 'react';

export type FontFamily = 'sans' | 'serif' | 'mono' | 'ia-mono' | 'ia-duo' | 'typewriter';

interface FontFamilyContextType {
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
}

export const FontFamilyContext = createContext<FontFamilyContextType | undefined>(undefined);

export function useFontFamily() {
  const context = useContext(FontFamilyContext);
  if (!context) {
    throw new Error('useFontFamily must be used within a FontFamilyProvider');
  }

  console.log('useFontFamily hook - fontFamily:', context.fontFamily);

  return context;
}