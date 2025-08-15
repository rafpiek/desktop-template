import { SamplePlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FontSizeContext, type FontSize } from '@/hooks/use-font-size';
import { useState } from 'react';

function Editor() {
  const [fontSize, setFontSize] = useState<FontSize>('md');

  console.log('Editor parent render - fontSize:', fontSize);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Editor</h1>
          <TooltipProvider>
            <SamplePlateEditor />
          </TooltipProvider>
        </div>
      </div>
    </FontSizeContext.Provider>
  )
}

export default Editor
