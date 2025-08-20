'use client';

import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Heading5, 
  Heading6,
  Quote,
  Minus,
  Image,
  FileText,
  List,
  ListOrdered
} from 'lucide-react';
import type { Editor, Range } from '@tiptap/core';

export interface SlashCommand {
  title: string;
  description: string;
  category: 'text' | 'headings' | 'media' | 'lists';
  icon: React.ComponentType<{ className?: string }>;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
  keywords: string[];
}

// Commands specifically designed for novel writers
export const NOVEL_WRITER_SLASH_COMMANDS: SlashCommand[] = [
  // Text blocks
  {
    title: 'Text',
    description: 'Just start writing with plain text.',
    category: 'text',
    icon: Type,
    keywords: ['text', 'paragraph', 'p'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setParagraph()
        .run();
    },
  },
  
  // Headings
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    category: 'headings',
    icon: Heading1,
    keywords: ['heading', 'h1', 'title', 'chapter'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    category: 'headings',
    icon: Heading2,
    keywords: ['heading', 'h2', 'subtitle', 'section'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 2 })
        .run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    category: 'headings',
    icon: Heading3,
    keywords: ['heading', 'h3', 'subsection'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 3 })
        .run();
    },
  },
  {
    title: 'Heading 4',
    description: 'Tiny section heading.',
    category: 'headings',
    icon: Heading4,
    keywords: ['heading', 'h4'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 4 })
        .run();
    },
  },
  {
    title: 'Heading 5',
    description: 'Really tiny heading.',
    category: 'headings',
    icon: Heading5,
    keywords: ['heading', 'h5'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 5 })
        .run();
    },
  },
  {
    title: 'Heading 6',
    description: 'Smallest heading.',
    category: 'headings',
    icon: Heading6,
    keywords: ['heading', 'h6'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 6 })
        .run();
    },
  },
  
  // Quote blocks
  {
    title: 'Quote',
    description: 'Capture a quote or dialogue.',
    category: 'text',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'dialogue', 'speech', 'citation'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setBlockquote()
        .run();
    },
  },
  
  // Lists
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    category: 'lists',
    icon: List,
    keywords: ['list', 'bullet', 'ul', 'unordered'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    category: 'lists',
    icon: ListOrdered,
    keywords: ['list', 'numbered', 'ol', 'ordered'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  
  // Dividers and media
  {
    title: 'Divider',
    description: 'Visually divide blocks.',
    category: 'media',
    icon: Minus,
    keywords: ['divider', 'hr', 'horizontal', 'rule', 'separator', 'break'],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
  },
  {
    title: 'Image',
    description: 'Upload an image.',
    category: 'media',
    icon: Image,
    keywords: ['image', 'picture', 'photo', 'img'],
    command: ({ editor, range }) => {
      // For now, just delete the range and add placeholder
      // TODO: Implement proper image upload dialog
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setImage({ src: '', alt: 'Image' })
        .run();
    },
  },
];

// Get commands by category
export const getCommandsByCategory = (category: SlashCommand['category']): SlashCommand[] => {
  return NOVEL_WRITER_SLASH_COMMANDS.filter(command => command.category === category);
};

// Search commands by query
export const searchCommands = (query: string): SlashCommand[] => {
  if (!query.trim()) return NOVEL_WRITER_SLASH_COMMANDS;
  
  const lowercaseQuery = query.toLowerCase();
  return NOVEL_WRITER_SLASH_COMMANDS.filter(command => 
    command.title.toLowerCase().includes(lowercaseQuery) ||
    command.description.toLowerCase().includes(lowercaseQuery) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};

// Categories for organizing the menu
export const COMMAND_CATEGORIES = [
  { id: 'text' as const, label: 'Text' },
  { id: 'headings' as const, label: 'Headings' },
  { id: 'lists' as const, label: 'Lists' },
  { id: 'media' as const, label: 'Media' },
] as const;