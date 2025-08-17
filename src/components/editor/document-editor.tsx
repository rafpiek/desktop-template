import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';
import { type Value } from 'platejs';
import { Maximize2, Minimize2 } from 'lucide-react';

import { EditorKit } from '@/components/editor/editor-kit';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { ZenModeContainer } from '@/components/editor/zen-mode-container';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { Button } from '@/components/ui/button';
import { useIsTauri } from '@/hooks/use-is-tauri';
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

// Backward compatibility function for legacy code
const calculateWordCount = (content: Value): number => {
  return calculateTextStats(content).wordCount;
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
  const isTauriApp = useIsTauri();
  const currentDocumentIdRef = React.useRef<string | null>(null);
  const lastSavedContentRef = React.useRef<Value>(emptyValue);

  console.log(`🔵 DocumentEditor render - documentId: ${documentId}, isZenMode: ${isZenMode}`);

  // Debug zen mode state changes
  React.useEffect(() => {
    console.log(`🧘 Zen mode state changed to: ${isZenMode}`);
  }, [isZenMode]);

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

  // Create stable editor with empty initial value
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: emptyValue,
  });

  console.log(`🔶 Editor created, documentId: ${documentId}`);

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
        console.log(`💾 Saving current document ${currentDocumentIdRef.current} before switch`);
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
          editor.tf.setValue(documentData.content);
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
          editor.tf.focus();
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
      const focusEditor = () => {
        console.log('🎯 DocumentEditor: focusEditor called');
        try {
          editor.tf.focus();
          console.log('🎯 DocumentEditor: editor.tf.focus() called');
          
          setTimeout(() => {
            try {
              // Position cursor at the start of the first block for new documents
              editor.tf.select({
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 0 }
              });
              console.log('🎯 DocumentEditor: cursor positioned at start');
            } catch (selectionError) {
              console.warn('🎯 DocumentEditor: Failed to set cursor position:', selectionError);
            }
          }, 50);
        } catch (error) {
          console.warn('🎯 DocumentEditor: Failed to focus editor:', error);
        }
      };
      onEditorReady(focusEditor);
    }
  }, [editor, onEditorReady]);

  return (
    <ZenModeContainer
      isZenMode={isZenMode}
      onToggleZenMode={toggleZenMode}
      className="relative"
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
        <EditorSettingsSheet />
      </div>

      <div className={cn(
        "editor",
        isZenMode ? "h-full overflow-y-auto" : "h-full"
      )}>
        {/* Single Plate component with conditional layout */}
        <Plate
          key={`editor-${documentId}`}
          editor={editor}
          onChange={({ value }) => {
            console.log(`✏️ User typing in ${documentId}`);
            debouncedSave(value);
          }}
        >
          {isZenMode ? (
            // Zen mode: Full-width scrollable container with centered content
            <div className="flex justify-center min-h-full">
              <div 
                className="w-full pt-24 pb-16 px-8 md:px-12 lg:px-16"
                style={{
                  width: '120ch',
                  maxWidth: '120ch'
                }}
              >
                <EditorContainer className="plate-editor h-full">
                  <Editor
                    variant="fullWidth"
                    className="w-full"
                  />
                </EditorContainer>
              </div>
            </div>
          ) : (
            // Normal mode: Standard layout
            <EditorContainer className="plate-editor h-full">
              <Editor
                variant="demo"
                className="h-full overflow-y-auto"
              />
            </EditorContainer>
          )}
          <SettingsDialog />
        </Plate>
      </div>
    </ZenModeContainer>
  );
}