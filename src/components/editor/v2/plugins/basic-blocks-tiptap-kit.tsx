'use client';

import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { type Extension } from '@tiptap/core';

// Basic blocks kit for novel writers - following existing pattern
export const BasicBlocksTiptapKit: Extension[] = [
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
    HTMLAttributes: {
      class: 'tiptap-heading',
    },
  }),
  
  Blockquote.configure({
    HTMLAttributes: {
      class: 'tiptap-blockquote border-l-4 border-muted-foreground pl-4 italic text-muted-foreground',
    },
  }),
  
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'tiptap-hr my-6 border-muted-foreground',
    },
  }),
];