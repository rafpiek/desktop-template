'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';
import { Maximize2, Minimize2 } from 'lucide-react';

import { ZenModeContainer } from '@/components/editor/zen-mode-container';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { FloatingStatsWidget } from '@/components/project/floating-stats-widget';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { cn } from '@/lib/utils';

import { TiptapEditor } from './tiptap-editor';
import { type TiptapValue } from './tiptap-types';
import { useTiptapStorage } from '@/hooks/use-tiptap-storage';
import { useTiptapFocusMode } from '@/hooks/use-tiptap-focus-mode';
import { useTiptapTypewriter } from '@/hooks/use-tiptap-typewriter';
import { TiptapSettingsIntegration } from './settings/tiptap-settings-integration';
import { safeFocus } from '@/lib/utils/tiptap-editor-utils';
import { safeTauriFocus } from '@/lib/utils/tauri-focus-manager';

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

  // State management - mirroring original DocumentEditor
  const [editor, setEditor] = React.useState<Editor | null>(null);
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [zenModePortalContainer, setZenModePortalContainer] = React.useState<HTMLElement | null>(null);
  const [isStatsVisible, setIsStatsVisible] = React.useState<boolean>(() => {
    // Load preference from localStorage, default to true
    try {
      const saved = localStorage.getItem('document-stats-visible');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const isTauriApp = useIsTauri();
  const { selectedProjectId } = useProject();

  // Handle stats widget visibility toggle
  const handleStatsToggle = (visible: boolean) => {
    setIsStatsVisible(visible);
    try {
      localStorage.setItem('document-stats-visible', JSON.stringify(visible));
    } catch {
      // Ignore localStorage errors
    }
  };

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
      onContentChange(content, textStats);
    }
  }, [content, textStats]);

  // Handle content changes from editor
  const handleContentUpdate = React.useCallback((newContent: TiptapValue, stats?: { 
    wordCount: number; 
    charactersWithSpaces: number; 
    charactersWithoutSpaces: number;
  }) => {
    // If stats are provided from the editor, use them directly for immediate updates
    if (stats) {
      setContent(newContent, stats);
    } else {
      setContent(newContent);
    }
  }, [setContent, documentId]);

  // Handle editor ready callback
  const handleEditorReady = React.useCallback((editorInstance: unknown) => {
    const ed = editorInstance as Editor;
    setEditor(ed);

    // Expose focus function to parent
    if (onEditorReady) {
      const focusEditor = () => {
        if (!ed || ed.isDestroyed) return;
        if (isTauriApp) {
          void safeTauriFocus(ed);
        } else {
          void safeFocus(ed, 10, 50);
        }
      };
      onEditorReady(focusEditor);
    }
  }, [documentId, onEditorReady, isTauriApp]);

  // Zen mode toggle - mirroring original implementation
  const toggleZenMode = React.useCallback(async () => {

    if (isTauriApp) {
      try {
        const { Window } = await import('@tauri-apps/api/window');
        const currentWindow = Window.getCurrent();
        const newFullscreenState = !isZenMode;
        await currentWindow.setFullscreen(newFullscreenState);
        setIsZenMode(newFullscreenState);
      } catch {
        setIsZenMode(!isZenMode);
      }
    } else {
      const newState = !isZenMode;
      setIsZenMode(newState);
    }
  }, [isTauriApp, isZenMode]);

  // Keyboard shortcut for zen mode - mirroring original
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        event.stopPropagation();
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
        <TiptapSettingsIntegration editor={editor} />
      </div>

      {/* Floating Stats Widget - Shows in both regular and zen modes */}
      <FloatingStatsWidget
        textStats={textStats}
        isVisible={isStatsVisible}
        onToggle={handleStatsToggle}
        documentId={documentId}
        projectId={selectedProjectId}
      />
    </ZenModeContainer>
  );
}
