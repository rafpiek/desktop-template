'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import { cn } from '@/lib/utils';
import { type TiptapValue } from './tiptap-types';
import { BasicEditorKit } from './plugins/basic-editor-kit';

interface TiptapEditorProps {
  initialContent?: TiptapValue;
  onUpdate?: (content: TiptapValue) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function TiptapEditor({
  initialContent,
  onUpdate,
  placeholder = 'Start writing...',
  className,
  autoFocus = false
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: BasicEditorKit,
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-prose',
          'min-h-[200px] w-full resize-none',
          'focus:outline-none',
          'px-4 py-3',
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto',
          className
        ),
        'spellcheck': 'true',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        const content = editor.getJSON() as TiptapValue;
        onUpdate(content);
      }
    },
    onCreate: ({ editor }) => {
      if (autoFocus) {
        // Small delay to ensure the editor is properly mounted
        setTimeout(() => {
          editor.commands.focus();
        }, 100);
      }
    },
    injectCSS: false,
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContent
        editor={editor}
        className="tiptap-content"
      />
    </div>
  );
}
