'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import { cn } from '@/lib/utils';
import { type TiptapValue } from './tiptap-types';
import { NovelWriterKit } from './plugins/novel-writer-kit';

interface TiptapEditorProps {
  documentId: string;
  initialContent: TiptapValue;
  onUpdate: (content: TiptapValue) => void;
  onReady: (editor: unknown) => void;
  autoFocus: boolean;
  focusMode: boolean;
}

export function TiptapEditor({ 
  documentId,
  initialContent, 
  onUpdate, 
  onReady, 
  autoFocus,
  focusMode 
}: TiptapEditorProps) {
  console.log(`🔧 TipTap: Creating editor for ${documentId}`, { initialContent, autoFocus, focusMode });

  const editor = useEditor({
    extensions: NovelWriterKit,
    
    content: initialContent,
    
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-prose prose prose-lg max-w-none',
          'min-h-full w-full resize-none',
          'focus:outline-none',
          'px-16 pt-4 pb-16',
          'sm:px-[max(64px,calc(50%-350px))]' // Same responsive padding as original
        ),
        'data-document-id': documentId,
        'spellcheck': 'true',
      },
      handleDOMEvents: {
        focus: () => {
          console.log(`🎯 TipTap: Editor focused for ${documentId}`);
        },
        blur: () => {
          console.log(`🎯 TipTap: Editor blurred for ${documentId}`);
        }
      }
    },
    
    onUpdate: ({ editor }) => {
      const content = editor.getJSON() as TiptapValue;
      console.log(`✏️ TipTap: Content updated for ${documentId}`);
      onUpdate(content);
    },
    
    onCreate: ({ editor }) => {
      console.log(`✅ TipTap: Editor created for ${documentId}`);
      onReady(editor);
      
      // Auto-focus if requested
      if (autoFocus) {
        setTimeout(() => {
          editor.commands.focus();
          console.log(`🎯 TipTap: Auto-focused editor for ${documentId}`);
        }, 100);
      }
    },
    
    onDestroy: () => {
      console.log(`💀 TipTap: Editor destroyed for ${documentId}`);
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
        console.log(`🔧 TipTap: Updating focus mode to ${focusMode} for ${documentId}`);
      }
    }
  }, [focusMode, editor, documentId]);

  // Log character count for debugging
  React.useEffect(() => {
    if (editor) {
      const characterCount = editor.storage.characterCount || {};
      console.log(`📊 TipTap: Stats for ${documentId}:`, {
        characters: characterCount.characters || 0,
        words: characterCount.words || 0
      });
    }
  }, [editor?.state.doc, documentId, editor]);

  // Handle content updates from props
  React.useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      
      // Only update if content is actually different
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        console.log(`🔄 TipTap: Updating content from props for ${documentId}`);
        editor.commands.setContent(initialContent, false);
      }
    }
  }, [initialContent, editor, documentId]);

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
      focusMode && 'focus-mode-active'
    )}>
      <EditorContent 
        editor={editor} 
        className="tiptap-content h-full overflow-y-auto"
      />
    </div>
  );
}