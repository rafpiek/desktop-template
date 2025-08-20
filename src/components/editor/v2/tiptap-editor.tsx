'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import { cn } from '@/lib/utils';
import { type TiptapValue } from './tiptap-types';
import { NovelWriterKit } from './plugins/novel-writer-kit';
import { type TypewriterMode } from '@/hooks/use-typewriter';

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
      handleDOMEvents: {
        focus: () => {
        },
        blur: () => {
        }
      }
    },

    onUpdate: ({ editor }) => {
      const content = editor.getJSON() as TiptapValue;
      onUpdate(content);
    },

    onCreate: ({ editor }) => {
      onReady(editor);

      // Auto-focus if requested, but ensure editor view is ready
      if (autoFocus) {
        let retryCount = 0;
        const maxRetries = 10; // Prevent infinite loops

        const focusWhenReady = () => {
          try {
            // Check if editor and view are available
            if (editor && editor.view && editor.view.dom && editor.commands) {
              editor.commands.focus();

              // Also trigger typewriter mode if it's active
              if (typewriterMode === 'center') {
                // Wait a bit more then force typewriter to activate
                setTimeout(() => {
                  if (editor && !editor.isDestroyed && editor.view && editor.view.docView) {
                    // Force a transaction to activate typewriter
                    const tr = editor.state.tr;
                    editor.view.dispatch(tr);

                    // Also manually trigger selection change
                    const event = new Event('selectionchange');
                    editor.view.dom.dispatchEvent(event);

                    console.log('🎯 TipTap Editor: Manually triggered typewriter after focus');
                  }
                }, 300);
              }
            } else if (retryCount < maxRetries) {
              // Retry after a short delay if not ready, but limit retries
              retryCount++;
              setTimeout(focusWhenReady, 50);
            }
          } catch (error) {
          }
        };

        // Start focus attempt after a small delay
        setTimeout(focusWhenReady, 100);
      }
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
    console.log('🎯 TipTap Editor: typewriter mode prop changed to:', typewriterMode);
    if (editor && editor.isEditable) {
      // Update the extension configuration
      editor.extensionManager.extensions.forEach(extension => {
        if (extension.name === 'typewriter') {
          console.log('🎯 TipTap Editor: Updating typewriter extension mode to:', typewriterMode);
          // Update the options
          extension.options.mode = typewriterMode;

          // Force a transaction to trigger the plugin's apply method
          const tr = editor.state.tr;
          editor.view.dispatch(tr);

          // Also manually trigger the selection change handler for immediate effect
          setTimeout(() => {
            const event = new Event('selectionchange');
            editor.view.dom.dispatchEvent(event);
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
        editor.commands.setContent(initialContent, false);

        // If typewriter mode is active, trigger it after content update
        if (typewriterMode === 'center') {
          setTimeout(() => {
            const tr = editor.state.tr;
            editor.view.dispatch(tr);
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
