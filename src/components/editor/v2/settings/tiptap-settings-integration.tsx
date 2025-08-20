'use client';

import { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { type FontSize } from '@/hooks/use-font-size';
import { type FontFamily } from '@/hooks/use-font-family';
import { type TypewriterMode } from '@/hooks/use-typewriter';

interface TiptapSettingsIntegrationProps {
  editor: Editor | null;
}

export function TiptapSettingsIntegration({ editor }: TiptapSettingsIntegrationProps) {
  const isApplyingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Apply settings when editor is ready and when settings change
  useEffect(() => {
    if (!editor) return;

    const applyStoredSettings = () => {
      // Prevent recursive calls
      if (isApplyingRef.current) return;
      
      // Check if editor view is ready before accessing it
      if (!editor.view || !editor.view.dom || editor.isDestroyed) {
        return; // Don't retry recursively
      }

      isApplyingRef.current = true;

      try {
        const fontSize = (localStorage.getItem('zeyn-font-size') as FontSize) || 'md';
        const fontFamily = (localStorage.getItem('zeyn-font-family') as FontFamily) || 'sans';
        const lineWidth = localStorage.getItem('zeyn-line-width') || 'default';
        const typewriterMode = (localStorage.getItem('typewriter-settings') ? 
          JSON.parse(localStorage.getItem('typewriter-settings')!)?.mode : 'off') as TypewriterMode;

        const editorElement = editor.view.dom as HTMLElement;
        const editorContainer = editorElement.closest('.tiptap-editor-container') as HTMLElement;
        const editorWrapper = document.querySelector('.tiptap-editor-wrapper') as HTMLElement;

        // Apply settings to editor element, container, and wrapper
        [editorElement, editorContainer, editorWrapper].forEach(element => {
          if (!element) return;

          // Remove old classes
          element.classList.remove(
            // Font sizes
            'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-zen',
            // Font families  
            'font-family-sans', 'font-family-serif', 'font-family-mono', 
            'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter',
            // Line widths
            'line-width-60', 'line-width-80', 'line-width-120', 
            'line-width-160', 'line-width-full', 'line-width-default',
            // Typewriter
            'typewriter-active', 'typewriter-center'
          );

          // Apply new classes
          element.classList.add(
            `font-size-${fontSize}`,
            `font-family-${fontFamily}`,
            `line-width-${lineWidth}`
          );

          // Apply typewriter classes - TipTap wrapper handles this differently
          if (typewriterMode === 'center' && element.classList.contains('tiptap-editor-wrapper')) {
            element.classList.add('typewriter-active');
          }
        });

        // Also apply to the main editor wrapper for consistency
        const mainEditorWrapper = document.querySelector('.editor.tiptap-editor-container') as HTMLElement;
        if (mainEditorWrapper) {
          mainEditorWrapper.classList.remove(
            'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-zen',
            'font-family-sans', 'font-family-serif', 'font-family-mono', 
            'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter',
            'line-width-60', 'line-width-80', 'line-width-120', 
            'line-width-160', 'line-width-full', 'line-width-default'
          );
          
          mainEditorWrapper.classList.add(
            `font-size-${fontSize}`,
            `font-family-${fontFamily}`,
            `line-width-${lineWidth}`
          );
        }
      } catch (error) {
        // Silently handle errors
      } finally {
        isApplyingRef.current = false;
      }
    };

    // Debounced apply function
    const debouncedApply = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          applyStoredSettings();
        }
      }, 100);
    };

    // Apply settings once when editor is ready
    debouncedApply();

    // Listen for localStorage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (
        e.key.startsWith('zeyn-font') || 
        e.key.startsWith('zeyn-line') || 
        e.key === 'typewriter-settings'
      )) {
        debouncedApply();
      }
    };

    // Listen for manual settings changes (within the same tab)
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.type === 'settings-change') {
        debouncedApply();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tiptap-settings-change', handleCustomEvent as EventListener);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tiptap-settings-change', handleCustomEvent as EventListener);
    };
  }, [editor]);

  return null; // This component doesn't render anything
}

// Helper function to trigger settings update manually
export const triggerTiptapSettingsUpdate = () => {
  const event = new CustomEvent('tiptap-settings-change', {
    detail: { type: 'settings-change' }
  });
  window.dispatchEvent(event);
};