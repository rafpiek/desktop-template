import { createContext, useContext } from 'react';

export type FontFamily = 'system' | 'roboto' | 'times' | 'ia-mono' | 'courier-prime' | 'ia-duo';

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
