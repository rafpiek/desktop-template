'use client';

import { Focus } from '@tiptap/extension-focus';
import { type Extension } from '@tiptap/core';

// Focus mode kit for typewriter experience
export const FocusModeTiptapKit: Extension[] = [
  Focus.configure({
    className: 'tiptap-focus',
    mode: 'all',
  }),
];