import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';
import { type Value } from 'platejs';
import { Maximize2, Minimize2 } from 'lucide-react';

import { EditorKit } from '@/components/editor/editor-kit';
import { EditorSettingsSheet } from '@/components/editor/editor-settings-sheet';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { Button } from '@/components/ui/button';
import { useFontSize, type FontSize } from '@/hooks/use-font-size';
import { useIsTauri } from '@/hooks/use-is-tauri';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const STORAGE_KEY = 'plate-editor-content';

const defaultValue = [
  {
    children: [{ text: 'Welcome to the Plate Playground!' }],
    type: 'h1',
  },
  {
    children: [
      { text: 'Experience a modern rich-text editor built with ' },
      { children: [{ text: 'Slate' }], type: 'a', url: 'https://slatejs.org' },
      { text: ' and ' },
      { children: [{ text: 'React' }], type: 'a', url: 'https://reactjs.org' },
      {
        text: ". This playground showcases just a part of Plate's capabilities. ",
      },
      {
        children: [{ text: 'Explore the documentation' }],
        type: 'a',
        url: '/docs',
      },
      { text: ' to discover more.' },
    ],
    type: 'p',
  },
  // Suggestions & Comments Section
  {
    children: [{ text: 'Collaborative Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Review and refine content seamlessly. Use ' },
      {
        children: [
          {
            suggestion: true,
            suggestion_playground1: {
              id: 'playground1',
              createdAt: Date.now(),
              type: 'insert',
              userId: 'alice',
            },
            text: 'suggestions',
          },
        ],
        type: 'a',
        url: '/docs/suggestion',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: ' ',
      },
      {
        suggestion: true,
        suggestion_playground1: {
          id: 'playground1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'alice',
        },
        text: 'like this added text',
      },
      { text: ' or to ' },
      {
        suggestion: true,
        suggestion_playground2: {
          id: 'playground2',
          createdAt: Date.now(),
          type: 'remove',
          userId: 'bob',
        },
        text: 'mark text for removal',
      },
      { text: '. Discuss changes using ' },
      {
        children: [
          { comment: true, comment_discussion1: true, text: 'comments' },
        ],
        type: 'a',
        url: '/docs/comment',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: ' on many text segments',
      },
      { text: '. You can even have ' },
      {
        comment: true,
        comment_discussion2: true,
        suggestion: true,
        suggestion_playground3: {
          id: 'playground3',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'charlie',
        },
        text: 'overlapping',
      },
      { text: ' annotations!' },
    ],
    type: 'p',
  },
  // {
  //   children: [
  //     {
  //       text: 'Block-level suggestions are also supported for broader feedback.',
  //     },
  //   ],
  //   suggestion: {
  //     suggestionId: 'suggestionBlock1',
  //     type: 'block',
  //     userId: 'charlie',
  //   },
  //   type: 'p',
  // },
  // AI Section
  {
    children: [{ text: 'AI-Powered Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Boost your productivity with integrated ' },
      {
        children: [{ text: 'AI SDK' }],
        type: 'a',
        url: '/docs/ai',
      },
      { text: '. Press ' },
      { kbd: true, text: '⌘+J' },
      { text: ' or ' },
      { kbd: true, text: 'Space' },
      { text: ' in an empty line to:' },
    ],
    type: 'p',
  },
  {
    children: [
      { text: 'Generate content (continue writing, summarize, explain)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: 'Edit existing text (improve, fix grammar, change tone)' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  // Core Features Section (Combined)
  {
    children: [{ text: 'Rich Content Editing' }],
    type: 'h2',
  },
  {
    children: [
      { text: 'Structure your content with ' },
      {
        children: [{ text: 'headings' }],
        type: 'a',
        url: '/docs/heading',
      },
      { text: ', ' },
      {
        children: [{ text: 'lists' }],
        type: 'a',
        url: '/docs/list',
      },
      { text: ', and ' },
      {
        children: [{ text: 'quotes' }],
        type: 'a',
        url: '/docs/blockquote',
      },
      { text: '. Apply ' },
      {
        children: [{ text: 'marks' }],
        type: 'a',
        url: '/docs/basic-marks',
      },
      { text: ' like ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'strikethrough' },
      { text: ', and ' },
      { code: true, text: 'code' },
      { text: '. Use ' },
      {
        children: [{ text: 'autoformatting' }],
        type: 'a',
        url: '/docs/autoformat',
      },
      { text: ' for ' },
      {
        children: [{ text: 'Markdown' }],
        type: 'a',
        url: '/docs/markdown',
      },
      { text: '-like shortcuts (e.g., ' },
      { kbd: true, text: '* ' },
      { text: ' for lists, ' },
      { kbd: true, text: '# ' },
      { text: ' for H1).' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Blockquotes are great for highlighting important information.',
          },
        ],
        type: 'p',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { children: [{ text: 'function hello() {' }], type: 'code_line' },
      {
        children: [{ text: "  console.info('Code blocks are supported!');" }],
        type: 'code_line',
      },
      { children: [{ text: '}' }], type: 'code_line' },
    ],
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [
      { text: 'Create ' },
      {
        children: [{ text: 'links' }],
        type: 'a',
        url: '/docs/link',
      },
      { text: ', ' },
      {
        children: [{ text: '@mention' }],
        type: 'a',
        url: '/docs/mention',
      },
      { text: ' users like ' },
      { children: [{ text: '' }], type: 'mention', value: 'Alice' },
      { text: ', or insert ' },
      {
        children: [{ text: 'emojis' }],
        type: 'a',
        url: '/docs/emoji',
      },
      { text: ' ✨. Use the ' },
      {
        children: [{ text: 'slash command' }],
        type: 'a',
        url: '/docs/slash-command',
      },
      { text: ' (/) for quick access to elements.' },
    ],
    type: 'p',
  },
  // Table Section
  {
    children: [{ text: 'How Plate Compares' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Plate offers many features out-of-the-box as free, open-source plugins.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              { children: [{ bold: true, text: 'Feature' }], type: 'p' },
            ],
            type: 'th',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Plate (Free & OSS)' }],
                type: 'p',
              },
            ],
            type: 'th',
          },
          {
            children: [
              { children: [{ bold: true, text: 'Tiptap' }], type: 'p' },
            ],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'AI' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Comments' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Suggestions' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Paid (Comments Pro)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Emoji Picker' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Table of Contents' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'Drag Handle' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [{ children: [{ text: 'Paid Extension' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Collaboration (Yjs)' }], type: 'p' },
            ],
            type: 'td',
          },
          {
            children: [
              {
                attributes: { align: 'center' },
                children: [{ text: '✅' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: 'Hocuspocus (OSS/Paid)' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
    type: 'table',
  },
  // Media Section
  {
    children: [{ text: 'Images and Media' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'Embed rich media like images directly in your content. Supports ',
      },
      {
        children: [{ text: 'Media uploads' }],
        type: 'a',
        url: '/docs/media',
      },
      {
        text: ' and ',
      },
      {
        children: [{ text: 'drag & drop' }],
        type: 'a',
        url: '/docs/dnd',
      },
      {
        text: ' for a smooth experience.',
      },
    ],
    type: 'p',
  },
  {
    attributes: { align: 'center' },
    caption: [
      {
        children: [{ text: 'Images with captions provide context.' }],
        type: 'p',
      },
    ],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '75%',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'sample.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },
  {
    children: [{ text: '' }],
    type: 'audio',
    url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  },
  {
    children: [{ text: 'Table of Contents' }],
    type: 'h3',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
];

interface PlateEditorProps {
  onEditorReady?: (focusEditor: () => void) => void;
  autoFocus?: boolean;
}

export function PlateEditor({ onEditorReady, autoFocus = true }: PlateEditorProps = {}) {
  const [isZenMode, setIsZenMode] = React.useState(false);
  const isTauriApp = useIsTauri();

  const { fontSize } = useFontSize();

  console.log('PlateEditor render - fontSize:', fontSize);

  const [editorValue, setEditorValue] = React.useState<Value>(defaultValue);

  const loadEditorValue = React.useCallback((): Value => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as Value;
      }
    } catch (error) {
      console.error('Failed to load editor content:', error);
    }

    return defaultValue;
  }, []);

  // Load saved content on mount
  React.useEffect(() => {
    const value = loadEditorValue();
    setEditorValue(value);
  }, []); // Only run on mount

  // Save content when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editorValue));
    } catch (error) {
      console.error('Failed to save editor content:', error);
    }
  }, [editorValue]);

  // Handle zen mode toggle
  const toggleZenMode = React.useCallback(async () => {
    console.log(
      'toggleZenMode called, isTauriApp:',
      isTauriApp,
      'current isZenMode:',
      isZenMode
    );


    if (isTauriApp) {
      // Use Tauri native fullscreen
      try {
        const { Window } = await import('@tauri-apps/api/window');
        const currentWindow = Window.getCurrent();

        console.log('Current window object:', currentWindow);

        const newFullscreenState = !isZenMode;
        console.log('Setting fullscreen to:', newFullscreenState);

        await currentWindow.setFullscreen(newFullscreenState);
        console.log('Fullscreen set successfully');

        setIsZenMode(newFullscreenState);
      } catch (error) {
        console.error('Failed to toggle fullscreen:', error);
        console.error('Error details:', error);
        // Fallback to CSS fullscreen if Tauri fails
        setIsZenMode(!isZenMode);
      }
    } else {
      // Use CSS fullscreen for web
      console.log('Using CSS fullscreen for web');
      setIsZenMode(!isZenMode);
    }
  }, [isTauriApp, isZenMode]);

  // Disable default keyboard shortcuts for zen mode (button-only control)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent F11 default behavior to avoid conflicts with our zen mode
      if (event.key === 'F11') {
        event.preventDefault();
        // Don't trigger zen mode - only button control allowed
        return;
      }

      // Prevent Escape from affecting window in Tauri when in zen mode
      if (event.key === 'Escape' && isZenMode && isTauriApp) {
        event.preventDefault();
        event.stopPropagation();
        // Don't exit zen mode - only button control allowed
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isZenMode, isTauriApp]);

  // Listen for native fullscreen changes (Tauri only) - simplified for now
  // React.useEffect(() => {
  //   // TODO: Add back window event listener once basic functionality works
  // }, [isTauriApp]);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: editorValue,
  }, [fontSize]); // Add fontSize as dependency to force re-creation

  // Auto-focus the editor when it's first loaded (only if autoFocus is enabled)
  React.useEffect(() => {
    if (editor && autoFocus) {
      // Small delay to ensure editor is fully rendered
      const timeoutId = setTimeout(() => {
        try {
          editor.tf.focus();
        } catch (error) {
          console.warn('Failed to auto-focus editor:', error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [editor, autoFocus]);

  // Expose focus function to parent
  React.useEffect(() => {
    if (onEditorReady && editor) {
      const focusEditor = () => {
        try {
          // Focus the editor first
          editor.tf.focus();
          
          // Small delay to ensure focus is set before positioning cursor
          setTimeout(() => {
            try {
              // Position cursor at the end of the first block (more natural)
              const firstNode = editor.children[0];
              if (firstNode && firstNode.children && firstNode.children.length > 0) {
                const lastChild = firstNode.children[firstNode.children.length - 1];
                const textLength = lastChild.text ? lastChild.text.length : 0;
                editor.tf.select({
                  anchor: { path: [0, firstNode.children.length - 1], offset: textLength },
                  focus: { path: [0, firstNode.children.length - 1], offset: textLength }
                });
              } else {
                // Fallback to start position
                editor.tf.select({
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: 0 }
                });
              }
            } catch (selectionError) {
              console.warn('Failed to set cursor position:', selectionError);
            }
          }, 50);
        } catch (error) {
          console.warn('Failed to focus editor:', error);
        }
      };
      onEditorReady(focusEditor);
    }
  }, [editor, onEditorReady]);

  return (
    <div
      className={cn(
        'relative',
        // Only apply CSS fullscreen for web browsers
        !isTauriApp && isZenMode && 'fixed inset-0 z-50 bg-background',
      )}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={toggleZenMode}
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2',
            isZenMode && 'bg-background/80 backdrop-blur-sm hover:bg-background/90'
          )}
        >
          {isZenMode ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Zen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Zen Mode
            </>
          )}
        </Button>
        <EditorSettingsSheet />
      </div>

      <div className={cn("editor", `font-size-${fontSize}`)}>
        <h1 key={`font-size-${fontSize}`}>font size: {fontSize}</h1>
        <Plate
          editor={editor}
          onChange={({ value }) => {
            setEditorValue(value);
          }}
        >
          <EditorContainer
            className={cn(
              // For web browsers, apply CSS fullscreen styles
              !isTauriApp && isZenMode && "h-screen max-h-screen",
              // For Tauri, adjust height when in zen mode
              isTauriApp && isZenMode && "h-screen max-h-screen"
            )}
          >
            <Editor
              variant={isZenMode ? "fullWidth" : "demo"}
              className={cn(
                isZenMode && "pt-16 h-full min-h-screen"
              )}
            />
          </EditorContainer>

          <SettingsDialog />
        </Plate>
      </div>
    </div>
  );
}
