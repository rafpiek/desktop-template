import { SamplePlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import * as React from 'react';

function Editor() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Editor</h1>
        <TooltipProvider>
          <SamplePlateEditor />
        </TooltipProvider>
      </div>
    </div>
  )
}

export default Editor
