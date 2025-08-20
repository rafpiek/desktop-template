'use client';

import { StarterKit } from '@tiptap/starter-kit';
import { UniqueID } from '@tiptap/extension-unique-id';
import { type Extension } from '@tiptap/core';

import { BasicBlocksTiptapKit } from './basic-blocks-tiptap-kit';
import { MediaTiptapKit } from './media-tiptap-kit';
import { FocusModeTiptapKit } from './focus-mode-tiptap-kit';
import { CharacterCountTiptapKit } from './character-count-tiptap-kit';

// Main plugin kit for novel writers - combines all needed extensions
export const NovelWriterKit: Extension[] = [
  // StarterKit with custom configuration
  StarterKit.configure({
    // Disable extensions we're replacing with custom ones
    heading: false,
    blockquote: false,
    horizontalRule: false,
    
    // Configure history
    history: {
      depth: 50,
      newGroupDelay: 500,
    },
    
    // Configure paragraph
    paragraph: {
      HTMLAttributes: {
        class: 'tiptap-paragraph',
      },
    },
    
    // Configure text formatting
    bold: {
      HTMLAttributes: {
        class: 'tiptap-bold font-bold',
      },
    },
    
    italic: {
      HTMLAttributes: {
        class: 'tiptap-italic italic',
      },
    },
    
    code: {
      HTMLAttributes: {
        class: 'tiptap-code bg-muted px-1 py-0.5 rounded text-sm font-mono',
      },
    },
    
    // Configure lists
    bulletList: {
      HTMLAttributes: {
        class: 'tiptap-bullet-list list-disc pl-6',
      },
    },
    
    orderedList: {
      HTMLAttributes: {
        class: 'tiptap-ordered-list list-decimal pl-6',
      },
    },
    
    listItem: {
      HTMLAttributes: {
        class: 'tiptap-list-item',
      },
    },
  }),
  
  // Unique IDs for blocks (needed for drag/drop later)
  UniqueID.configure({
    types: ['heading', 'paragraph', 'blockquote', 'horizontalRule', 'image'],
    attributeName: 'id',
    createId: () => crypto.randomUUID(),
  }),
  
  // Our custom kits
  ...BasicBlocksTiptapKit,
  ...MediaTiptapKit,
  ...FocusModeTiptapKit,
  ...CharacterCountTiptapKit,
];