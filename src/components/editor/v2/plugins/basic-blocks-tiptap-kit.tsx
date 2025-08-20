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
    renderHTML({ node, HTMLAttributes }) {
      const level = node.attrs.level;
      const classes = [HTMLAttributes.class || '', `tiptap-heading-${level}`].join(' ').trim();
      
      return [
        `h${level}`,
        { ...HTMLAttributes, class: classes, 'data-level': level },
        0,
      ];
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