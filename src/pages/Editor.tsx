import { SamplePlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FontSizeContext, type FontSize } from '@/hooks/use-font-size';
import { FontFamilyContext, type FontFamily } from '@/hooks/use-font-family';
import { useState } from 'react';

function Editor() {
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');

  console.log('Editor parent render - fontSize:', fontSize);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <FontFamilyContext.Provider value={{ fontFamily, setFontFamily }}>
        <div className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Editor</h1>
            <TooltipProvider>
              <SamplePlateEditor />
            </TooltipProvider>
          </div>
        </div>
      </FontFamilyContext.Provider>
    </FontSizeContext.Provider>
  )
}

export default Editor
