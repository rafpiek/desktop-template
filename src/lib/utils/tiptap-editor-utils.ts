import { type Editor } from '@tiptap/react';

/**
 * Safely checks if an editor instance has a fully functional view
 * This is especially important in Tauri environments where view mounting can be delayed
 */
export function isEditorViewReady(editor: Editor | null): boolean {
  if (!editor || editor.isDestroyed) {
    return false;
  }

  try {
    // Check if view exists and has essential properties
    if (!editor.view || !editor.view.dom) {
      return false;
    }

    // Additional check for view functionality
    // In Tauri, the view might exist but not be fully functional yet
    if (typeof editor.view.hasFocus !== 'function') {
      return false;
    }

    // Check if DOM is connected to document
    if (!editor.view.dom.isConnected) {
      return false;
    }

    // Try calling hasFocus to ensure it actually works
    try {
      editor.view.hasFocus;
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Safely dispatches a transaction to the editor view
 * Returns true if successful, false otherwise
 */
export function safeDispatch(editor: Editor | null, transaction: unknown): boolean {
  if (!isEditorViewReady(editor)) {
    return false;
  }

  try {
    editor!.view.dispatch(transaction);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely dispatches a DOM event to the editor view
 * Returns true if successful, false otherwise
 */
export function safeDispatchDOMEvent(editor: Editor | null, event: Event): boolean {
  if (!isEditorViewReady(editor)) {
    return false;
  }

  try {
    editor!.view.dom.dispatchEvent(event);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely executes any editor command with proper error handling
 * Returns true if successful, false otherwise
 */
export function safeExecuteCommand(editor: Editor | null, commandFn: (editor: Editor) => void): boolean {
  if (!isEditorViewReady(editor)) {
    return false;
  }

  try {
    commandFn(editor!);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely focuses the editor with retry logic for Tauri environments
 * Returns a promise that resolves when focus is successful or retries are exhausted
 */
export function safeFocus(editor: Editor | null, maxRetries: number = 10, retryDelay: number = 50): Promise<boolean> {
  return new Promise((resolve) => {
    let retryCount = 0;

    const attemptFocus = () => {
      if (!editor || editor.isDestroyed) {
        resolve(false);
        return;
      }

      // Use safeExecuteCommand for focus
      const success = safeExecuteCommand(editor, (ed) => ed.commands.focus());
      if (success) {
        resolve(true);
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptFocus, retryDelay);
      } else {
        resolve(false);
      }
    };

    attemptFocus();
  });
}

/**
 * Waits for the editor view to be ready with exponential backoff
 * Useful for operations that must wait for the view to be fully mounted
 */
export function waitForEditorView(editor: Editor | null, maxRetries: number = 20, initialDelay: number = 50): Promise<boolean> {
  return new Promise((resolve) => {
    let retryCount = 0;
    let delay = initialDelay;

    const checkView = () => {
      if (!editor || editor.isDestroyed) {
        resolve(false);
        return;
      }

      if (isEditorViewReady(editor)) {
        resolve(true);
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkView, delay);
        delay = Math.min(delay * 1.5, 500); // Exponential backoff with max 500ms
      } else {
        resolve(false);
      }
    };

    checkView();
  });
}

/**
 * Safely executes a function that requires the editor view to be ready
 * Automatically retries with backoff if the view is not ready
 */
export async function executeWhenViewReady<T>(
  editor: Editor | null, 
  operation: (editor: Editor) => T,
  maxRetries: number = 10
): Promise<T | null> {
  const isReady = await waitForEditorView(editor, maxRetries);
  
  if (!isReady || !editor) {
    return null;
  }

  try {
    return operation(editor);
  } catch {
    return null;
  }
}