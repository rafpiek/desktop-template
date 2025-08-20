'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import { cn } from '@/lib/utils';
import { type TiptapValue } from './tiptap-types';
import { NovelWriterKit } from './plugins/novel-writer-kit';
import { type TypewriterMode } from '@/hooks/use-typewriter';
import {
  isEditorViewReady,
  safeDispatch,
  safeDispatchDOMEvent,
  safeFocus,
  safeExecuteCommand,
  waitForEditorView,
  executeWhenViewReady
} from '@/lib/utils/tiptap-editor-utils';
import {
  isTauriEnvironment,
  initializeTauriEditor,
  safeTauriFocus
} from '@/lib/utils/tauri-focus-manager';

interface TiptapEditorProps {
  documentId: string;
  initialContent: TiptapValue;
  onUpdate: (content: TiptapValue) => void;
  onReady: (editor: unknown) => void;
  autoFocus: boolean;
  focusMode: boolean;
  typewriterMode: TypewriterMode;
}

export function TiptapEditor({
  documentId,
  initialContent,
  onUpdate,
  onReady,
  autoFocus,
  focusMode,
  typewriterMode
}: TiptapEditorProps) {

  const editor = useEditor({
    extensions: NovelWriterKit,

    content: initialContent,

    editorProps: {
      attributes: {
        class: cn(
          'tiptap-prose',
          'min-h-full w-full resize-none',
          'focus:outline-none',
          'px-16 pt-4 pb-16',
          'sm:px-[max(64px,calc(50%-350px))]' // Same responsive padding as original
        ),
        'data-document-id': documentId,
        'spellcheck': 'true',
        'data-placeholder': 'Start writing...',
      },
    },

    onUpdate: ({ editor }) => {
      const content = editor.getJSON() as TiptapValue;
      onUpdate(content);
    },

    onCreate: ({ editor }) => {
      const handleEditorCreate = async () => {
        try {
          // Initialize Tauri environment if needed
          if (isTauriEnvironment()) {
            console.log('🚀 Initializing Tauri editor environment...');
            const initialized = await initializeTauriEditor(editor);
            if (!initialized) {
              console.warn('⚠️ Tauri editor initialization failed, proceeding anyway');
            } else {
              console.log('✅ Tauri editor environment ready');
            }
          }

          // Notify parent that editor is ready
          console.log('editor built', editor);
          onReady(editor);

          // Auto-focus if requested
          if (autoFocus) {
            const focusWhenReady = async () => {
              try {
                let focusSuccess = false;

                if (isTauriEnvironment()) {
                  // Use Tauri-specific focus method
                  focusSuccess = await safeTauriFocus(editor);
                } else {
                  // Use regular safe focus for browser
                  focusSuccess = await safeFocus(editor, 10, 50);
                }

                if (focusSuccess && typewriterMode === 'center') {
                  // Activate typewriter mode after successful focus
                  setTimeout(async () => {
                    await executeWhenViewReady(editor, (editor) => {
                      const tr = editor.state.tr;
                      safeDispatch(editor, tr);

                      const event = new Event('selectionchange');
                      safeDispatchDOMEvent(editor, event);
                    });
                  }, 200);
                }
              } catch (error) {
                console.warn('Focus initialization failed:', error);
              }
            };

            // Delay focus based on environment
            const focusDelay = isTauriEnvironment() ? 300 : 100;
            setTimeout(focusWhenReady, focusDelay);
          }
        } catch (error) {
          console.error('Editor creation failed:', error);
          // Still notify parent even if setup fails
          onReady(editor);
        }
      };

      // Start the async initialization
      handleEditorCreate();
    },

    onDestroy: () => {
    },

    // Enable immediate updates for better UX
    injectCSS: false, // We'll handle CSS ourselves
  });

  // Update focus mode when prop changes
  React.useEffect(() => {
    if (editor) {
      const focusExtension = editor.extensionManager.extensions.find(ext => ext.name === 'focus');
      if (focusExtension) {
        // Update focus mode
      }
    }
  }, [focusMode, documentId]);

  // Update typewriter mode when prop changes
  React.useEffect(() => {
    if (editor && editor.isEditable && isEditorViewReady(editor)) {
      // Update the extension configuration
      editor.extensionManager.extensions.forEach(extension => {
        if (extension.name === 'typewriter') {
          // Update the options
          extension.options.mode = typewriterMode;

          // Force a transaction to trigger the plugin's apply method
          const tr = editor.state.tr;
          safeDispatch(editor, tr);

          // Also manually trigger the selection change handler for immediate effect
          setTimeout(() => {
            const event = new Event('selectionchange');
            safeDispatchDOMEvent(editor, event);
          }, 50);
        }
      });
    }
  }, [editor, typewriterMode]);

  // Log character count for debugging
  React.useEffect(() => {
    if (editor) {
      const characterCount = editor.storage.characterCount || {};
    }
  }, [documentId]);

  // Handle content updates from props
  React.useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      const currentContent = editor.getJSON();

      // Only update if content is actually different
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        safeExecuteCommand(editor, (ed) => ed.commands.setContent(initialContent, false));

        // If typewriter mode is active, trigger it after content update
        if (typewriterMode === 'center') {
          setTimeout(() => {
            const tr = editor.state.tr;
            safeDispatch(editor, tr);
          }, 100);
        }
      }
    }
  }, [initialContent, documentId, typewriterMode]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading TipTap editor...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      'tiptap-editor-wrapper h-full',
      focusMode && 'focus-mode-active',
      typewriterMode === 'center' && 'typewriter-active'
    )}>
      <EditorContent
        editor={editor}
        className="tiptap-content h-full overflow-y-auto editor-scroll"
      />
    </div>
  );
}
