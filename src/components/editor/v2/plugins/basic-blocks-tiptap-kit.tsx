'use client';

import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
// Basic blocks kit for template - following existing pattern
export const BasicBlocksTiptapKit = [
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
];