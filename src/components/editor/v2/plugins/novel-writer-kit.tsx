'use client';

import { StarterKit } from '@tiptap/starter-kit';
import { UniqueID } from '@tiptap/extension-unique-id';
import { type Extension } from '@tiptap/core';

import { BasicBlocksTiptapKit } from './basic-blocks-tiptap-kit';
import { MediaTiptapKit } from './media-tiptap-kit';
import { FocusModeTiptapKit } from './focus-mode-tiptap-kit';
import { CharacterCountTiptapKit } from './character-count-tiptap-kit';
import { SlashCommandTiptapKit } from './slash-command-tiptap-kit';
import { DragDropTiptapKit } from './drag-drop-tiptap-kit';
import { TypewriterTiptapKit } from './typewriter-tiptap-kit';
import { PlaceholderTiptapKit } from './placeholder-tiptap-kit';

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
        class: 'tiptap-bold',
      },
    },
    
    italic: {
      HTMLAttributes: {
        class: 'tiptap-italic',
      },
    },
    
    code: {
      HTMLAttributes: {
        class: 'tiptap-code',
      },
    },
    
    // Configure lists
    bulletList: {
      HTMLAttributes: {
        class: 'tiptap-bullet-list',
      },
    },
    
    orderedList: {
      HTMLAttributes: {
        class: 'tiptap-ordered-list',
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
  ...SlashCommandTiptapKit,
  ...DragDropTiptapKit,
  ...TypewriterTiptapKit,
  ...PlaceholderTiptapKit,
];