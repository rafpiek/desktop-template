'use client';

import type { JSONContent } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';

// Following existing naming pattern (MyValue → TiptapValue)
export type TiptapValue = JSONContent;

export interface TiptapTextStats {
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
}

export interface TiptapDocumentData {
  content: TiptapValue;
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  lastModified: string;
  version: string; // For future migrations
}

// Block type definitions for novel writers
export interface TiptapHeadingAttrs {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
}

export interface TiptapCalloutAttrs {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
}

export interface TiptapImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

// Slash command configuration
export interface TiptapSlashCommand {
  title: string;
  description: string;
  category: 'text' | 'headings' | 'media' | 'blocks';
  icon: React.ComponentType;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
  keywords: string[];
}

// Focus mode configuration
export interface TiptapFocusModeSettings {
  enabled: boolean;
  mode: 'sentence' | 'paragraph' | 'typewriter';
  dimOpacity: number;
}

// Empty TipTap document structure
export const EMPTY_TIPTAP_DOCUMENT: TiptapValue = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: ''
        }
      ]
    }
  ]
};