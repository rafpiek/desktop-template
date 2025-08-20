'use client';

import { CharacterCount } from '@tiptap/extension-character-count';
import { type Extension } from '@tiptap/core';

// Character count kit for real-time stats
export const CharacterCountTiptapKit: Extension[] = [
  CharacterCount.configure({
    // No limit - we just want the counting functionality
  }),
];