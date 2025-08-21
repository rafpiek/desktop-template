'use client';

import { CharacterCount } from '@tiptap/extension-character-count';
import { type Extension } from '@tiptap/core';

// Character count kit for real-time stats
export const CharacterCountTiptapKit: Extension[] = [
  CharacterCount.configure({
    // No limit - we just want the counting functionality
    // Configure word counter to properly split on all whitespace including newlines
    wordCounter: (text) => {
      // Handle empty text
      if (!text || !text.trim()) return 0;
      
      // Split on any whitespace (spaces, tabs, newlines, etc.) and filter empty strings
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },
  }),
];