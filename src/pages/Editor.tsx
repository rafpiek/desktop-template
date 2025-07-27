import { PlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/app-layout';

function Editor() {
  return (
    <AppLayout title="Editor">
      <TooltipProvider>
        <PlateEditor />
      </TooltipProvider>
    </AppLayout>
  )
}

export default Editor
