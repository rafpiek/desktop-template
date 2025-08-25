'use client';

import { StarterKit } from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { History } from '@tiptap/extension-history';
// Basic editor kit for desktop template
export const BasicEditorKit = [
  StarterKit.configure({
    heading: false, // We'll configure this separately
    blockquote: false, // We'll configure this separately
    horizontalRule: false, // We'll configure this separately
  }),
  
  History.configure({
    depth: 100,
  }),
  
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
    HTMLAttributes: {
      class: 'tiptap-heading',
    },
  }),
  
  Blockquote.configure({
    HTMLAttributes: {
      class: 'tiptap-blockquote',
    },
  }),
  
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'tiptap-hr',
    },
  }),
  
  Image.configure({
    HTMLAttributes: {
      class: 'tiptap-image max-w-full h-auto rounded-lg shadow-sm',
    },
    allowBase64: true,
    inline: false,
  }),
];