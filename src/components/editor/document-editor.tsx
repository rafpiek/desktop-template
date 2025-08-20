import * as React from 'react';

import {
  Plate,
  usePlateEditor,
} from 'platejs/react';
import { type Value } from 'platejs';
import { Editor as SlateEditor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Maximize2, Minimize2 } from 'lucide-react';

import { DocumentEditorKit } from '@/components/editor/document-editor-kit';
import { type MyValue } from '@/components/editor/plate-types';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { ZenModeContainer } from '@/components/editor/zen-mode-container';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { Button } from '@/components/ui/button';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { useTypewriter } from '@/hooks/use-typewriter';
import { cn } from '@/lib/utils';

// Utility function to calculate text statistics from editor content
const calculateTextStats = (content: Value): {
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
} => {
  if (!content || content.length === 0) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  const extractText = (node: unknown): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'object' && node !== null) {
      const nodeObj = node as Record<string, unknown>;
      if (typeof nodeObj.text === 'string') return nodeObj.text;
      if (Array.isArray(nodeObj.children)) {
        return nodeObj.children.map(extractText).join('');
      }
    }
    return '';
  };

  const fullText = content.map(extractText).join(' ');

  if (!fullText.trim()) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  // Calculate all metrics at once for efficiency
  const charactersWithSpaces = fullText.length;
  const charactersWithoutSpaces = fullText.replace(/\s/g, '').length;
  const wordCount = fullText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return { wordCount, charactersWithSpaces, charactersWithoutSpaces };
};


const getDocumentStorageKey = (documentId: string) => `document-data-${documentId}`;

interface DocumentData {
  content: Value;
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  lastModified: string;
}

const emptyValue: Value = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
];

interface DocumentEditorProps {
  documentId: string;
  onEditorReady?: (focusEditor: () => void) => void;
  autoFocus?: boolean;
  onContentChange?: (content: Value, stats: {
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  }) => void;
}

export function DocumentEditor({
  documentId,
  onEditorReady,
  autoFocus = true,
  onContentChange
}: DocumentEditorProps) {
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [zenModePortalContainer, setZenModePortalContainer] =
    React.useState<HTMLElement | null>(null);
  const isTauriApp = useIsTauri();
  const [typewriterSettings] = useTypewriter();
  const currentDocumentIdRef = React.useRef<string | null>(null);
  const lastSavedContentRef = React.useRef<Value>(emptyValue);

  const editor = usePlateEditor({
    plugins: DocumentEditorKit,
    value: emptyValue,
  });

  console.log(
    `🔵 DocumentEditor render - documentId: ${documentId}, isZenMode: ${isZenMode}`
  );

  // Debug zen mode state changes and portal container
  React.useEffect(() => {
    console.log(`🧘 Zen mode: ${isZenMode}, Portal container:`, zenModePortalContainer);
    if (zenModePortalContainer) {
      console.log(`🌀 Portal container id: ${zenModePortalContainer.id}, class: ${zenModePortalContainer.className}`);
    }
  }, [isZenMode, zenModePortalContainer]);

  // Load document data (content + metadata)
  const loadDocumentData = React.useCallback((docId: string): {
    content: Value;
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  } => {
    const defaultStats = { content: emptyValue, wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };

    if (typeof window === 'undefined') return defaultStats;

    const storageKey = getDocumentStorageKey(docId);
    console.log(`📖 Loading document data for ${docId} with key: ${storageKey}`);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const documentData = JSON.parse(saved) as DocumentData;
        console.log(`📖 Found saved document data for ${docId}:`, documentData);

        // Validate content structure
        if (!documentData.content || documentData.content.length === 0) {
          return defaultStats;
        }

        // Handle backward compatibility - if character counts are missing, calculate them
        if (documentData.charactersWithSpaces === undefined || documentData.charactersWithoutSpaces === undefined) {
          console.log(`📖 Missing character counts for ${docId}, calculating...`);
          const stats = calculateTextStats(documentData.content);

          // Update stored data with new fields
          const updatedData: DocumentData = {
            content: documentData.content,
            wordCount: stats.wordCount,
            charactersWithSpaces: stats.charactersWithSpaces,
            charactersWithoutSpaces: stats.charactersWithoutSpaces,
            lastModified: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(updatedData));

          return {
            content: documentData.content,
            wordCount: stats.wordCount,
            charactersWithSpaces: stats.charactersWithSpaces,
            charactersWithoutSpaces: stats.charactersWithoutSpaces
          };
        }

        return {
          content: documentData.content,
          wordCount: documentData.wordCount || 0,
          charactersWithSpaces: documentData.charactersWithSpaces || 0,
          charactersWithoutSpaces: documentData.charactersWithoutSpaces || 0
        };
      } else {
        console.log(`📖 No saved data found for ${docId}, using empty values`);
      }
    } catch (error) {
      console.error('Failed to load document data:', error);
      console.log('📖 Falling back to legacy content-only storage...');

      // Fallback: Try loading old format (content-only)
      try {
        const legacyKey = `document-content-${docId}`;
        const legacySaved = localStorage.getItem(legacyKey);
        if (legacySaved) {
          const content = JSON.parse(legacySaved) as Value;
          const stats = calculateTextStats(content);
          console.log(`📖 Migrated legacy content for ${docId}, calculated stats:`, stats);

          // Save in new format and remove old
          const documentData: DocumentData = {
            content,
            wordCount: stats.wordCount,
            charactersWithSpaces: stats.charactersWithSpaces,
            charactersWithoutSpaces: stats.charactersWithoutSpaces,
            lastModified: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(documentData));
          localStorage.removeItem(legacyKey);

          return {
            content,
            wordCount: stats.wordCount,
            charactersWithSpaces: stats.charactersWithSpaces,
            charactersWithoutSpaces: stats.charactersWithoutSpaces
          };
        }
      } catch (legacyError) {
        console.error('Failed to migrate legacy content:', legacyError);
      }
    }

    return defaultStats;
  }, []);

  // Save document data (content + metadata)
  const saveDocumentData = React.useCallback((content: Value, docId: string) => {
    if (typeof window === 'undefined') return;

    const storageKey = getDocumentStorageKey(docId);

    // Calculate all text statistics only once when saving
    const stats = calculateTextStats(content);
    const documentData: DocumentData = {
      content,
      wordCount: stats.wordCount,
      charactersWithSpaces: stats.charactersWithSpaces,
      charactersWithoutSpaces: stats.charactersWithoutSpaces,
      lastModified: new Date().toISOString()
    };

    console.log(`💾 Saving document data for ${docId}:`, {
      wordCount: stats.wordCount,
      charactersWithSpaces: stats.charactersWithSpaces,
      charactersWithoutSpaces: stats.charactersWithoutSpaces,
      contentLength: content.length
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(documentData));
      console.log(`💾 Successfully saved document data for ${docId} (${stats.wordCount} words, ${stats.charactersWithSpaces} chars)`);
      lastSavedContentRef.current = content;

      // Notify parent component of content changes (pass pre-calculated stats)
      if (onContentChange) {
        onContentChange(content, stats);
      }
    } catch (error) {
      console.error('Failed to save document data:', error);
    }
  }, [onContentChange]);

  // Core typewriter centering logic as a stable callback
  const centerActiveBlock = React.useCallback(() => {
    if (typewriterSettings.mode === 'off' || !editor || !editor.selection) return;
    if (!Range.isCollapsed(editor.selection)) return;

    const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
      let el: HTMLElement | null = element;
      while (el) {
        const style = window.getComputedStyle(el);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
        if (canScroll) return el;
        el = el.parentElement;
      }
      return null;
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blockEntry = (SlateEditor as any).above(editor as any, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        match: (n: any) => (SlateEditor as any).isBlock(editor as any, n),
      });
      if (!blockEntry) return;

      const [block] = blockEntry;
      const blockEl = ReactEditor.toDOMNode(editor as any, block) as HTMLElement;

      // Highlight only this block
      const prev = blockEl.parentElement?.querySelector('.tw-active');
      if (prev && prev !== blockEl) prev.classList.remove('tw-active');
      blockEl.classList.add('tw-active');

      const scrollContainer =
        findScrollContainer(blockEl) || (document.querySelector('.editor .editor-scroll') as HTMLElement | null);
      if (!scrollContainer) return;

      // Apply generous padding so even short docs center nicely
      const pad = Math.round(window.innerHeight * 0.45);
      scrollContainer.style.scrollPaddingTop = `${pad}px`;
      scrollContainer.style.scrollPaddingBottom = `${pad}px`;
      scrollContainer.style.paddingTop = `${pad}px`;
      scrollContainer.style.paddingBottom = `${pad}px`;

      const capturedSelection = editor.selection;
      requestAnimationFrame(() => {
        try {
          if (!capturedSelection) return;
          const domRange = ReactEditor.toDOMRange(editor as any, capturedSelection as any);
          const caretRect = domRange.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const desiredTopWithin = containerRect.height / 2;
          const currentTopWithin = caretRect.top - containerRect.top;
          const delta = currentTopWithin - desiredTopWithin;
          const rawTarget = scrollContainer.scrollTop + delta;
          const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
          const target = Math.max(0, Math.min(maxScroll, rawTarget));
          if (Math.abs(target - scrollContainer.scrollTop) > 0.5) {
            scrollContainer.scrollTo({ top: target, behavior: 'smooth' });
          }
        } catch {
          try {
            blockEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          } catch {}
        }
      });
    } catch {
      // no-op
    }
  }, [editor, typewriterSettings.mode]);

  // Typewriter Mode Effect (selection changes)
  React.useEffect(() => {
    const isRangeSelected = editor?.selection ? !Range.isCollapsed(editor.selection) : false;
    const now = performance.now();
    if (!isRangeSelected && now >= (suppressSelectionUntilRef.current || 0)) {
      centerActiveBlock();
    }
  }, [centerActiveBlock, editor?.selection]);

  // Keydown hook to trigger centering immediately after input like Enter
  const rafTokenRef = React.useRef<number | null>(null);
  const suppressSelectionUntilRef = React.useRef<number>(0);
  const handleEditorKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (typewriterSettings.mode === 'off') return;
    if (event.shiftKey) return; // don't center while extending selection
    const keysToCenter = new Set([
      'Enter',
      'Backspace',
      'Delete',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Tab',
    ]);
    if (!keysToCenter.has(event.key)) return;

    // Run after Slate updates selection/layout, avoid stacking
    if (rafTokenRef.current) cancelAnimationFrame(rafTokenRef.current);
    rafTokenRef.current = requestAnimationFrame(() => {
      rafTokenRef.current = null;
      // Suppress selection-change handler briefly so we don't double-center
      suppressSelectionUntilRef.current = performance.now() + 120;
      centerActiveBlock();
    });
  }, [centerActiveBlock, typewriterSettings.mode]);

  // Cleanup/highlight removal when turning mode off or on unmount
  React.useEffect(() => {
    if (typewriterSettings.mode === 'off') {
      const active = document.querySelector('.typewriter-active .tw-active');
      if (active) active.classList.remove('tw-active');
      const scrollContainer = document.querySelector('.editor .editor-scroll') as HTMLElement | null;
      if (scrollContainer) {
        scrollContainer.style.scrollPaddingTop = '';
        scrollContainer.style.scrollPaddingBottom = '';
        scrollContainer.style.paddingTop = '';
        scrollContainer.style.paddingBottom = '';
      }
    }
    return () => {
      const active = document.querySelector('.typewriter-active .tw-active');
      if (active) active.classList.remove('tw-active');
    };
  }, [typewriterSettings.mode]);

  // Debounced save function
  const debouncedSave = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (content: Value) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log(`⏰ Debounced save triggered for ${documentId}`);
        saveDocumentData(content, documentId);
      }, 1000);
    };
  }, [saveDocumentData, documentId]);

  // Load content when document changes (including initial load)
  React.useEffect(() => {
    console.log(`🔄 Document effect: current=${currentDocumentIdRef.current}, new=${documentId}`);

    if (currentDocumentIdRef.current !== documentId) {
      // Save current content before switching (skip if this is initial load)
      if (editor && currentDocumentIdRef.current !== null) {
        const currentContent = editor.children as Value;
        console.log(
          `💾 Saving current document ${currentDocumentIdRef.current} before switch`
        );
        saveDocumentData(currentContent, currentDocumentIdRef.current);
      }

      // Load new document data (content + word count)
      const documentData = loadDocumentData(documentId);
      console.log(`📖 Loading document ${documentId}:`, documentData);

      // Update refs
      currentDocumentIdRef.current = documentId;
      lastSavedContentRef.current = documentData.content;

      // Update editor with loaded content
      if (editor) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor as any).tf.setValue(documentData.content);
          console.log(`✅ Successfully loaded content for ${documentId}`, {
            wordCount: documentData.wordCount,
            charactersWithSpaces: documentData.charactersWithSpaces,
            charactersWithoutSpaces: documentData.charactersWithoutSpaces
          });

          // Immediately notify parent with loaded stats (no calculation needed!)
          if (onContentChange) {
            onContentChange(documentData.content, {
              wordCount: documentData.wordCount,
              charactersWithSpaces: documentData.charactersWithSpaces,
              charactersWithoutSpaces: documentData.charactersWithoutSpaces
            });
          }
        } catch (error) {
          console.error(`❌ Failed to load content for ${documentId}:`, error);
        }
      }
    }
  }, [documentId, editor, loadDocumentData, saveDocumentData, onContentChange]);

  // Handle zen mode toggle
  const toggleZenMode = React.useCallback(async () => {
    console.log(`🎯 Toggle zen mode called - current state: ${isZenMode}`);

    if (isTauriApp) {
      try {
        const { Window } = await import('@tauri-apps/api/window');
        const currentWindow = Window.getCurrent();
        const newFullscreenState = !isZenMode;
        await currentWindow.setFullscreen(newFullscreenState);
        setIsZenMode(newFullscreenState);
        console.log(`🖥️ Tauri fullscreen ${newFullscreenState ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('❌ Failed to toggle Tauri fullscreen:', error);
        setIsZenMode(!isZenMode);
      }
    } else {
      // For web, just toggle state - ZenModeContainer handles the rest
      const newState = !isZenMode;
      setIsZenMode(newState);
      console.log(`🌐 Web zen mode ${newState ? 'enabled' : 'disabled'}`);
    }
  }, [isTauriApp, isZenMode]);

  // Keyboard shortcut for zen mode toggle (Cmd/Ctrl + Shift + F)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux)
      // Note: event.key is case-sensitive and returns 'f' not 'F' when shift is pressed
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        event.stopPropagation();
        console.log('⌨️ Zen mode shortcut triggered (Cmd/Ctrl+Shift+F)');
        console.log('Key details:', {
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey
        });
        toggleZenMode();
        return false; // Prevent any default browser behavior
      }
    };

    // Add global keyboard listener with capture phase to intercept before browser
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [toggleZenMode]);

  // Auto-focus the editor when it's first loaded
  React.useEffect(() => {
    if (editor && autoFocus) {
      const timeoutId = setTimeout(() => {
        try {
          ReactEditor.focus(editor as any);
          const { children } = editor;
          if (
            children.length === 1 &&
            (children[0] as any).children.length === 1 &&
            (children[0] as any).children[0].text === ''
          ) {
            Transforms.select(editor as any, {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 0 },
            });
          }
        } catch (error) {
          console.warn('Failed to auto-focus editor:', error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [editor, autoFocus]);

  // Expose focus function to parent
  React.useEffect(() => {
    if (onEditorReady && editor) {
      const focus = () => {
        console.log('🎯 DocumentEditor: focusEditor called');
        try {
          ReactEditor.focus(editor as any);
          console.log('🎯 DocumentEditor: editor focused');

          setTimeout(() => {
            try {
              // Position cursor at the start of the first block for new documents
              Transforms.select(editor as any, {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 0 },
              });
              console.log('🎯 DocumentEditor: cursor positioned at start');
            } catch (selectionError) {
              console.warn(
                '🎯 DocumentEditor: Failed to set cursor position:',
                selectionError
              );
            }
          }, 50);
        } catch (error) {
          console.warn('🎯 DocumentEditor: Failed to focus editor:', error);
        }
      };
      onEditorReady(focus);
    }
  }, [editor, onEditorReady]);

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

      <div
        className={cn(
          'editor',
          isZenMode ? 'h-full overflow-y-auto' : 'h-full',
          typewriterSettings.mode === 'center' && 'typewriter-active'
        )}
      >
        {/* Single Plate component with conditional layout */}
        <Plate
          key={`editor-${documentId}`}
          editor={editor}
          onChange={({ value }) => {
            console.log(`✏️ User typing in ${documentId}`);
            debouncedSave(value);
          }}
        >
          <div className="h-full flex flex-col">
            {/* Use same structure for both modes to preserve settings */}
            <EditorContainer className="plate-editor flex-1 border-2 border-red-700">
              <Editor
                variant="none"
                className="editor-scroll h-full overflow-y-auto px-16 pt-4 pb-16 sm:px-[max(64px,calc(50%-350px))]"
                onKeyDown={handleEditorKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>}
              />
            </EditorContainer>
            <SettingsDialog />
          </div>
        </Plate>
      </div>
    </ZenModeContainer>
  );
}
