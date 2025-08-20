'use client';

/**
 * Simple test component to verify TipTap Document Editor v2 functionality
 * This can be used for quick testing during development
 */

import React from 'react';
import { DocumentEditorV2 } from './document-editor-v2';

export function TiptapTest() {
  const [stats, setStats] = React.useState({
    wordCount: 0,
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
  });

  const handleContentChange = React.useCallback((content: unknown, newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  const handleEditorReady = React.useCallback((focusEditor: () => void) => {
    focusEditor();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-muted/50 p-4 border-b">
        <h1 className="text-lg font-semibold">TipTap Document Editor v2 Test</h1>
        <div className="text-sm text-muted-foreground flex gap-4 mt-2">
          <span>Words: {stats.wordCount}</span>
          <span>Characters (with spaces): {stats.charactersWithSpaces}</span>
          <span>Characters (without spaces): {stats.charactersWithoutSpaces}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          💡 Try typing, using slash commands (/), focus mode, zen mode (Cmd+Shift+F), and typewriter mode in settings
        </div>
      </div>
      
      <div className="flex-1">
        <DocumentEditorV2
          documentId="test-document"
          onEditorReady={handleEditorReady}
          onContentChange={handleContentChange}
          autoFocus={true}
        />
      </div>
    </div>
  );
}

// Prevent fast refresh warning
const _testComponentName = 'TiptapTest';