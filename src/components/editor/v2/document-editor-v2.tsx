'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';
import { Maximize2, Minimize2 } from 'lucide-react';

import { ZenModeContainer } from '@/components/editor/zen-mode-container';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Button } from '@/components/ui/button';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { cn } from '@/lib/utils';

import { TiptapEditor } from './tiptap-editor';
import { type TiptapValue } from './tiptap-types';
import { useTiptapStorage } from '@/hooks/use-tiptap-storage';
import { useTiptapFocusMode } from '@/hooks/use-tiptap-focus-mode';
import { useTiptapTypewriter } from '@/hooks/use-tiptap-typewriter';
import { TiptapSettingsIntegration } from './settings/tiptap-settings-integration';

// Exact same interface as original DocumentEditor to ensure drop-in compatibility
interface DocumentEditorV2Props {
  documentId: string;
  onEditorReady?: (focusEditor: () => void) => void;
  autoFocus?: boolean;
  onContentChange?: (content: unknown, stats: {
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  }) => void;
}

export function DocumentEditorV2({
  documentId,
  onEditorReady,
  autoFocus = true,
  onContentChange
}: DocumentEditorV2Props) {
  console.log(`🔵 DocumentEditorV2 render - documentId: ${documentId}`);

  // State management - mirroring original DocumentEditor
  const [editor, setEditor] = React.useState<Editor | null>(null);
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [zenModePortalContainer, setZenModePortalContainer] = React.useState<HTMLElement | null>(null);
  
  const isTauriApp = useIsTauri();
  
  // Use our custom hooks
  const { focusMode } = useTiptapFocusMode();
  const { mode: typewriterMode } = useTiptapTypewriter();
  const { 
    content, 
    setContent, 
    textStats, 
    isLoading 
  } = useTiptapStorage(documentId);

  // Notify parent component of content changes
  React.useEffect(() => {
    if (content && onContentChange) {
      console.log(`📊 TipTap: Notifying parent of content changes for ${documentId}`, textStats);
      onContentChange(content, textStats);
    }
  }, [content, textStats, documentId, onContentChange]);

  // Handle content changes from editor
  const handleContentUpdate = React.useCallback((newContent: TiptapValue) => {
    console.log(`✏️ TipTap: User typing in ${documentId}`);
    setContent(newContent);
  }, [documentId, setContent]);

  // Handle editor ready callback
  const handleEditorReady = React.useCallback((editorInstance: Editor) => {
    console.log(`🎯 TipTap: Editor ready for ${documentId}`);
    setEditor(editorInstance);

    // Expose focus function to parent
    if (onEditorReady) {
      const focusEditor = () => {
        console.log('🎯 TipTap: focusEditor called');
        if (editorInstance) {
          editorInstance.commands.focus();
        }
      };
      onEditorReady(focusEditor);
    }
  }, [documentId, onEditorReady]);

  // Zen mode toggle - mirroring original implementation
  const toggleZenMode = React.useCallback(async () => {
    console.log(`🎯 TipTap: Toggle zen mode called - current state: ${isZenMode}`);

    if (isTauriApp) {
      try {
        const { Window } = await import('@tauri-apps/api/window');
        const currentWindow = Window.getCurrent();
        const newFullscreenState = !isZenMode;
        await currentWindow.setFullscreen(newFullscreenState);
        setIsZenMode(newFullscreenState);
        console.log(`🖥️ TipTap: Tauri fullscreen ${newFullscreenState ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('❌ TipTap: Failed to toggle Tauri fullscreen:', error);
        setIsZenMode(!isZenMode);
      }
    } else {
      const newState = !isZenMode;
      setIsZenMode(newState);
      console.log(`🌐 TipTap: Web zen mode ${newState ? 'enabled' : 'disabled'}`);
    }
  }, [isTauriApp, isZenMode]);

  // Keyboard shortcut for zen mode - mirroring original
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        event.stopPropagation();
        console.log('⌨️ TipTap: Zen mode shortcut triggered');
        toggleZenMode();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [toggleZenMode]);

  return (
    <ZenModeContainer
      isZenMode={isZenMode}
      onToggleZenMode={toggleZenMode}
      className="relative h-full"
      onPortalContainerReady={setZenModePortalContainer}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={toggleZenMode}
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2',
            isZenMode && 'bg-background/80 backdrop-blur-sm hover:bg-background/90'
          )}
          title={isZenMode ? "Exit Zen Mode (⌘⇧F / Ctrl+Shift+F)" : "Enter Zen Mode (⌘⇧F / Ctrl+Shift+F)"}
        >
          {isZenMode ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Zen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Zen Mode
            </>
          )}
        </Button>
        <EditorSettingsSheet container={isZenMode ? zenModePortalContainer : undefined} />
      </div>

      <div className={cn(
        'editor tiptap-editor-container',
        isZenMode ? 'h-full overflow-y-auto' : 'h-full',
        focusMode && 'focus-mode-active'
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading document...</div>
          </div>
        ) : content ? (
          <TiptapEditor
            documentId={documentId}
            initialContent={content}
            onUpdate={handleContentUpdate}
            onReady={handleEditorReady}
            autoFocus={autoFocus}
            focusMode={focusMode}
            typewriterMode={typewriterMode}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">No content available</div>
          </div>
        )}
        <SettingsDialog />
        <TiptapSettingsIntegration editor={editor} />
      </div>
    </ZenModeContainer>
  );
}