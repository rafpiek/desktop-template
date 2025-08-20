# TipTap Document Editor v2 - Ultra-Detailed Implementation Plan

## 🎯 Goal
Create a drop-in replacement for the current Plate.js DocumentEditor using TipTap v3 with Notion-like features, maintaining exact interface compatibility while leveraging existing architecture patterns.

## 📦 Dependencies Installation
```bash
# Core TipTap v3 packages
bun add novel @tiptap/react @tiptap/core @tiptap/starter-kit
bun add @tiptap/extension-character-count @tiptap/extension-focus
bun add @tiptap/extension-unique-id @tiptap/extension-slash-command
bun add @tiptap/extension-drag-handle-react @tiptap/extension-block-selection

# Novel Writers specific extensions
bun add @tiptap/extension-heading @tiptap/extension-blockquote
bun add @tiptap/extension-image @tiptap/extension-horizontal-rule
bun add @tiptap/extension-callout @tiptap/extension-indent

# Additional utilities
bun add @tiptap/extension-markdown @tiptap/extension-history
```

## 📁 Directory Structure & Files

### 📂 Core Architecture
```
src/
├── components/
│   ├── editor/
│   │   ├── v2/                                    # 🆕 New TipTap v2 directory
│   │   │   ├── document-editor-v2.tsx             # 🎯 Main component (drop-in replacement)
│   │   │   ├── tiptap-editor.tsx                  # Core TipTap editor wrapper
│   │   │   ├── tiptap-types.ts                    # TypeScript type definitions
│   │   │   ├── plugins/                           # Plugin kits (following existing pattern)
│   │   │   │   ├── novel-writer-kit.tsx           # Combined kit for novel writers
│   │   │   │   ├── basic-blocks-tiptap-kit.tsx    # H1-H6, paragraphs, quotes
│   │   │   │   ├── media-tiptap-kit.tsx           # Images, dividers
│   │   │   │   ├── indent-tiptap-kit.tsx          # Nested blocks (3 levels max)
│   │   │   │   ├── selection-tiptap-kit.tsx       # Multi-block selection
│   │   │   │   ├── drag-drop-tiptap-kit.tsx       # Drag handles and feedback
│   │   │   │   ├── focus-mode-tiptap-kit.tsx      # Typewriter/focus mode
│   │   │   │   ├── slash-command-tiptap-kit.tsx   # Categorized slash commands
│   │   │   │   └── character-count-tiptap-kit.tsx # Real-time stats
│   │   │   ├── slash-commands/
│   │   │   │   ├── slash-command-menu.tsx         # Main slash command interface
│   │   │   │   ├── slash-command-items.tsx        # Command definitions
│   │   │   │   └── novel-writer-commands.ts       # Novel-specific commands config
│   │   │   ├── settings/
│   │   │   │   ├── tiptap-settings-integration.tsx # Settings compatibility layer
│   │   │   │   └── tiptap-typewriter-mode.tsx     # Focus mode implementation
│   │   │   ├── storage/
│   │   │   │   ├── tiptap-storage.ts              # localStorage with prefixes
│   │   │   │   ├── tiptap-backup.ts               # JSON + Markdown export
│   │   │   │   └── tiptap-migration.ts            # Future Plate→TipTap migration
│   │   │   └── utils/
│   │   │       ├── tiptap-text-stats.ts           # Word/character counting
│   │   │       ├── tiptap-markdown-export.ts      # Markdown conversion
│   │   │       └── tiptap-dom-utils.ts            # DOM manipulation helpers
│   │   └── [existing files...]
├── hooks/
│   ├── use-tiptap-editor.ts                       # 🆕 TipTap editor management
│   ├── use-tiptap-storage.ts                      # 🆕 TipTap localStorage integration
│   ├── use-tiptap-focus-mode.ts                   # 🆕 Focus/typewriter mode state
│   └── [existing files...]
├── lib/
│   ├── types/
│   │   ├── tiptap.ts                              # 🆕 TipTap-specific types
│   │   └── [existing files...]
│   └── utils/
│       ├── tiptap-content-utils.ts                # 🆕 Content transformation utilities
│       └── [existing files...]
└── components/
    └── ui/
        ├── tiptap-nodes/                          # 🆕 TipTap UI components
        │   ├── tiptap-heading-node.tsx            # H1-H6 components
        │   ├── tiptap-blockquote-node.tsx         # Quote component
        │   ├── tiptap-paragraph-node.tsx          # Paragraph component
        │   ├── tiptap-image-node.tsx              # Image component
        │   ├── tiptap-hr-node.tsx                 # Horizontal rule
        │   ├── tiptap-callout-node.tsx            # Callout component
        │   └── tiptap-drag-handle.tsx             # Drag handle component
        └── [existing files...]
```

## 📋 Detailed File Implementations

### 1. 🎯 Main Component: `document-editor-v2.tsx`
```typescript
// src/components/editor/v2/document-editor-v2.tsx
'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';
import { ZenModeContainer } from '@/components/editor/zen-mode-container';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { TiptapEditor } from './tiptap-editor';
import { useTiptapStorage } from '@/hooks/use-tiptap-storage';
import { useTiptapFocusMode } from '@/hooks/use-tiptap-focus-mode';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { type TiptapValue, type TiptapTextStats } from './tiptap-types';

// Exact same interface as original DocumentEditor
interface DocumentEditorV2Props {
  documentId: string;
  onEditorReady?: (focusEditor: () => void) => void;
  autoFocus?: boolean;
  onContentChange?: (content: any, stats: {
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  }) => void;
}

export function DocumentEditorV2({
  documentId,
  onEditorReady,
  autoFocus = true,
  onContentChange
}: DocumentEditorV2Props) {
  const [editor, setEditor] = React.useState<Editor | null>(null);
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [zenModePortalContainer, setZenModePortalContainer] = React.useState<HTMLElement | null>(null);

  const isTauriApp = useIsTauri();
  const { focusMode, toggleFocusMode } = useTiptapFocusMode();
  const {
    content,
    saveContent,
    textStats,
    loadDocumentData,
    saveDocumentData
  } = useTiptapStorage(documentId);

  // ... implementation matching original DocumentEditor interface
}
```

### 2. 🧠 Core TipTap Wrapper: `tiptap-editor.tsx`
```typescript
// src/components/editor/v2/tiptap-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { NovelWriterKit } from './plugins/novel-writer-kit';
import { type TiptapValue } from './tiptap-types';

interface TiptapEditorProps {
  initialContent: TiptapValue;
  onUpdate: (content: TiptapValue) => void;
  onReady: (editor: Editor) => void;
  focusMode: boolean;
  autoFocus: boolean;
  documentId: string;
}

export function TiptapEditor({
  initialContent,
  onUpdate,
  onReady,
  focusMode,
  autoFocus,
  documentId
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: NovelWriterKit,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-lg max-w-none',
        'data-document-id': documentId
      }
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON() as TiptapValue;
      onUpdate(content);
    },
    onCreate: ({ editor }) => {
      onReady(editor);
    }
  });

  return (
    <div className={`tiptap-container ${focusMode ? 'focus-mode-active' : ''}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 3. 📝 Type Definitions: `tiptap-types.ts`
```typescript
// src/components/editor/v2/tiptap-types.ts
import type { JSONContent } from '@tiptap/react';

// Following existing naming pattern (MyValue → TiptapValue)
export type TiptapValue = JSONContent[];

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
```

### 4. 🔌 Plugin Architecture

#### A. Main Plugin Kit: `novel-writer-kit.tsx`
```typescript
// src/components/editor/v2/plugins/novel-writer-kit.tsx
'use client';

import { StarterKit } from '@tiptap/starter-kit';
import { BasicBlocksTiptapKit } from './basic-blocks-tiptap-kit';
import { MediaTiptapKit } from './media-tiptap-kit';
import { IndentTiptapKit } from './indent-tiptap-kit';
import { SelectionTiptapKit } from './selection-tiptap-kit';
import { DragDropTiptapKit } from './drag-drop-tiptap-kit';
import { FocusModeTiptapKit } from './focus-mode-tiptap-kit';
import { SlashCommandTiptapKit } from './slash-command-tiptap-kit';
import { CharacterCountTiptapKit } from './character-count-tiptap-kit';

export const NovelWriterKit = [
  StarterKit.configure({
    // Disable default heading to use our custom ones
    heading: false,
    // Configure other starter kit options
    history: {
      depth: 50,
    },
    blockquote: false, // Use custom blockquote
    horizontalRule: false, // Use custom hr
  }),
  ...BasicBlocksTiptapKit,
  ...MediaTiptapKit,
  ...IndentTiptapKit,
  ...SelectionTiptapKit,
  ...DragDropTiptapKit,
  ...FocusModeTiptapKit,
  ...SlashCommandTiptapKit,
  ...CharacterCountTiptapKit,
];
```

#### B. Basic Blocks Kit: `basic-blocks-tiptap-kit.tsx`
```typescript
// src/components/editor/v2/plugins/basic-blocks-tiptap-kit.tsx
'use client';

import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { TiptapHeadingNode } from '@/components/ui/tiptap-nodes/tiptap-heading-node';
import { TiptapBlockquoteNode } from '@/components/ui/tiptap-nodes/tiptap-blockquote-node';
import { TiptapHrNode } from '@/components/ui/tiptap-nodes/tiptap-hr-node';

export const BasicBlocksTiptapKit = [
  Heading.extend({
    addNodeView() {
      return ({ node, HTMLAttributes, editor }) => {
        return new TiptapHeadingNode(node, HTMLAttributes, editor);
      };
    },
  }).configure({
    levels: [1, 2, 3, 4, 5, 6],
    HTMLAttributes: {
      class: 'tiptap-heading',
    },
  }),

  Blockquote.extend({
    addNodeView() {
      return ({ node, HTMLAttributes, editor }) => {
        return new TiptapBlockquoteNode(node, HTMLAttributes, editor);
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'tiptap-blockquote',
    },
  }),

  HorizontalRule.extend({
    addNodeView() {
      return ({ node, HTMLAttributes, editor }) => {
        return new TiptapHrNode(node, HTMLAttributes, editor);
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'tiptap-hr',
    },
  }),
];
```

### 5. 🎣 Custom Hooks

#### A. TipTap Editor Hook: `use-tiptap-editor.ts`
```typescript
// src/hooks/use-tiptap-editor.ts
import { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { TiptapValue } from '@/components/editor/v2/tiptap-types';

export function useTiptapEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
    setIsReady(true);
  }, []);

  const focusEditor = useCallback(() => {
    if (editor && isReady) {
      editor.commands.focus();
    }
  }, [editor, isReady]);

  const getContent = useCallback((): TiptapValue => {
    if (!editor) return [];
    return editor.getJSON().content as TiptapValue;
  }, [editor]);

  const setContent = useCallback((content: TiptapValue) => {
    if (editor) {
      editor.commands.setContent({ type: 'doc', content });
    }
  }, [editor]);

  return {
    editor,
    isReady,
    handleEditorReady,
    focusEditor,
    getContent,
    setContent,
  };
}
```

#### B. TipTap Storage Hook: `use-tiptap-storage.ts`
```typescript
// src/hooks/use-tiptap-storage.ts
import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '@/components/editor/v2/tiptap-types';
import { calculateTiptapTextStats } from '@/lib/utils/tiptap-content-utils';

// Following existing pattern: document-data-${id} → tiptap-document-data-${id}
const getTiptapStorageKey = (documentId: string) => `tiptap-document-data-${documentId}`;

export function useTiptapStorage(documentId: string) {
  const [content, setContent] = useState<TiptapValue>([]);
  const [textStats, setTextStats] = useState<TiptapTextStats>({
    wordCount: 0,
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
  });

  const debouncedContent = useDebounce(content, 1000); // 1 second debounce

  const loadDocumentData = useCallback((docId: string): TiptapDocumentData => {
    const storageKey = getTiptapStorageKey(docId);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved) as TiptapDocumentData;
        return data;
      }
    } catch (error) {
      console.error('Failed to load TipTap document data:', error);
    }

    // Return empty document
    return {
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
      wordCount: 0,
      charactersWithSpaces: 0,
      charactersWithoutSpaces: 0,
      lastModified: new Date().toISOString(),
      version: '1.0',
    };
  }, []);

  const saveDocumentData = useCallback((content: TiptapValue, docId: string) => {
    const storageKey = getTiptapStorageKey(docId);
    const stats = calculateTiptapTextStats(content);

    const documentData: TiptapDocumentData = {
      content,
      ...stats,
      lastModified: new Date().toISOString(),
      version: '1.0',
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(documentData));
      setTextStats(stats);
    } catch (error) {
      console.error('Failed to save TipTap document data:', error);
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (debouncedContent.length > 0) {
      saveDocumentData(debouncedContent, documentId);
    }
  }, [debouncedContent, documentId, saveDocumentData]);

  return {
    content,
    setContent,
    textStats,
    loadDocumentData,
    saveDocumentData,
  };
}
```

### 6. 🎨 UI Components (Following Existing Pattern)

#### A. Heading Node: `tiptap-heading-node.tsx`
```typescript
// src/components/ui/tiptap-nodes/tiptap-heading-node.tsx
'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { cn } from '@/lib/utils';
import type { NodeViewProps } from '@tiptap/react';

interface TiptapHeadingNodeProps extends NodeViewProps {
  // Add any additional props needed
}

export function TiptapHeadingNode({ node, HTMLAttributes, updateAttributes }: TiptapHeadingNodeProps) {
  const level = node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const headingClasses = cn(
    'tiptap-heading',
    `tiptap-h${level}`,
    {
      'text-4xl font-bold': level === 1,
      'text-3xl font-semibold': level === 2,
      'text-2xl font-semibold': level === 3,
      'text-xl font-medium': level === 4,
      'text-lg font-medium': level === 5,
      'text-base font-medium': level === 6,
    }
  );

  return (
    <NodeViewWrapper className="tiptap-heading-wrapper">
      <HeadingTag
        {...HTMLAttributes}
        className={cn(HTMLAttributes.class, headingClasses)}
        data-level={level}
      />
    </NodeViewWrapper>
  );
}
```

### 7. ⚙️ Settings Integration: `tiptap-settings-integration.tsx`
```typescript
// src/components/editor/v2/settings/tiptap-settings-integration.tsx
'use client';

import { useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { type FontSize } from '@/hooks/use-font-size';
import { type FontFamily } from '@/hooks/use-font-family';
import { type TypewriterMode } from '@/hooks/use-typewriter';

interface TiptapSettingsIntegrationProps {
  editor: Editor | null;
}

export function TiptapSettingsIntegration({ editor }: TiptapSettingsIntegrationProps) {
  // Apply font size settings (following existing pattern)
  useEffect(() => {
    const applyStoredSettings = () => {
      if (!editor) return;

      const fontSize = (localStorage.getItem('zeyn-font-size') as FontSize) || 'md';
      const fontFamily = (localStorage.getItem('zeyn-font-family') as FontFamily) || 'sans';
      const lineWidth = localStorage.getItem('zeyn-line-width') || 'default';

      const editorElement = editor.view.dom as HTMLElement;

      // Remove old classes
      editorElement.classList.remove(
        'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-zen',
        'font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter',
        'line-width-60', 'line-width-80', 'line-width-120', 'line-width-160', 'line-width-full', 'line-width-default'
      );

      // Apply new classes
      editorElement.classList.add(
        `font-size-${fontSize}`,
        `font-family-${fontFamily}`,
        `line-width-${lineWidth}`
      );
    };

    applyStoredSettings();

    // Listen for storage changes to apply settings in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('zeyn-font') || e.key?.startsWith('zeyn-line')) {
        applyStoredSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [editor]);

  return null; // This is a utility component, no UI
}
```

### 8. 🔧 Feature Flag Implementation

#### A. Document View Integration: `document-view.tsx` (modification)
```typescript
// Add to src/components/project/document-view.tsx
import { DocumentEditorV2 } from '@/components/editor/v2/document-editor-v2';

// Feature flag constant
const USE_TIPTAP_EDITOR = true; // Toggle between editors

// In the render section:
{USE_TIPTAP_EDITOR ? (
  <DocumentEditorV2
    documentId={document.id}
    onEditorReady={setFocusEditor}
    autoFocus={!isNewDocument}
    onContentChange={handleContentChange}
  />
) : (
  <DocumentEditor
    documentId={document.id}
    onEditorReady={setFocusEditor}
    autoFocus={!isNewDocument}
    onContentChange={handleContentChange}
  />
)}
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Day 1-2)
1. **Setup Dependencies**
   - Install TipTap packages with Bun
   - Create directory structure

2. **Core Files**
   - `tiptap-types.ts` - Type definitions
   - `document-editor-v2.tsx` - Main component skeleton
   - `tiptap-editor.tsx` - Basic editor wrapper
   - Feature flag in `document-view.tsx`

### Phase 2: Basic Functionality (Day 2-3)
1. **Storage System**
   - `use-tiptap-storage.ts` - localStorage integration
   - `tiptap-storage.ts` - Storage utilities
   - Basic content persistence

2. **Core Plugins**
   - `novel-writer-kit.tsx` - Main plugin collection
   - `basic-blocks-tiptap-kit.tsx` - Headings, paragraphs, quotes

### Phase 3: Advanced Features (Day 3-4)
1. **Notion-like Features**
   - Slash commands implementation
   - Drag and drop functionality
   - Block selection and multi-select

2. **Settings Integration**
   - `tiptap-settings-integration.tsx`
   - Font, size, typewriter mode compatibility

### Phase 4: Polish & Testing (Day 4-5)
1. **Focus Mode & Zen Mode**
   - TipTap Focus extension integration
   - ZenModeContainer compatibility

2. **Export & Backup**
   - Markdown export functionality
   - JSON backup system
   - Error handling and recovery

### Phase 5: Documentation & Finalization (Day 5)
1. **Testing**
   - A/B testing setup
   - Data migration validation

2. **Documentation**
   - Save implementation plan
   - Add code comments
   - Create usage guide

## 🔍 Testing Strategy
- **Feature Flag**: `USE_TIPTAP_EDITOR` for A/B testing
- **Storage Separation**: `tiptap-document-data-*` vs `document-data-*`
- **Interface Compatibility**: Exact same props and callbacks
- **Progressive Enhancement**: Can fall back to Plate.js if needed

## 📊 Success Metrics
- ✅ Drop-in replacement (same interface)
- ✅ All existing features working
- ✅ Notion-like experience (slash commands, drag-drop, blocks)
- ✅ Settings persistence and application
- ✅ Performance equivalent or better
- ✅ Stable storage and backup system
