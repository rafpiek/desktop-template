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
  // Apply settings when editor is ready and when settings change
  useEffect(() => {
    if (!editor) return;

    const applyStoredSettings = () => {
      // Check if editor view is ready before accessing it
      if (!editor.view || !editor.view.dom) {
        console.warn('🔧 TipTap Settings: Editor view not ready, retrying...');
        setTimeout(applyStoredSettings, 100);
        return;
      }

      const fontSize = (localStorage.getItem('zeyn-font-size') as FontSize) || 'md';
      const fontFamily = (localStorage.getItem('zeyn-font-family') as FontFamily) || 'sans';
      const lineWidth = localStorage.getItem('zeyn-line-width') || 'default';
      const typewriterMode = (localStorage.getItem('typewriter-settings') ? 
        JSON.parse(localStorage.getItem('typewriter-settings')!)?.mode : 'off') as TypewriterMode;

      console.log('🔧 TipTap Settings: Applying settings', {
        fontSize,
        fontFamily,
        lineWidth,
        typewriterMode
      });

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
    };

    // Apply settings with a small delay to ensure editor is ready
    setTimeout(applyStoredSettings, 200);

    // Listen for localStorage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (
        e.key.startsWith('zeyn-font') || 
        e.key.startsWith('zeyn-line') || 
        e.key === 'typewriter-settings'
      )) {
        console.log('🔧 TipTap Settings: Storage changed, reapplying settings');
        setTimeout(applyStoredSettings, 50); // Small delay to ensure storage is updated
      }
    };

    // Listen for manual settings changes (within the same tab)
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.type === 'settings-change') {
        console.log('🔧 TipTap Settings: Manual settings change detected');
        setTimeout(applyStoredSettings, 50);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tiptap-settings-change', handleCustomEvent as EventListener);

    // Also observe DOM changes to catch editor replacements
    const observer = new MutationObserver(() => {
      setTimeout(applyStoredSettings, 100);
    });

    const observeTarget = document.querySelector('.tiptap-editor-container');
    if (observeTarget) {
      observer.observe(observeTarget, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tiptap-settings-change', handleCustomEvent as EventListener);
      observer.disconnect();
    };
  }, [editor]);

  // Also sync focus mode settings when focus mode changes
  useEffect(() => {
    if (!editor) return;

    const applyFocusMode = () => {
      // Check if editor view is ready before accessing extensions
      if (!editor.view || !editor.view.dom || !editor.extensionManager) {
        console.warn('🎯 TipTap Settings: Editor not ready for focus mode, retrying...');
        setTimeout(applyFocusMode, 100);
        return;
      }

      const focusSettings = localStorage.getItem('tiptap-focus-mode-settings');
      if (focusSettings) {
        try {
          const settings = JSON.parse(focusSettings);
          const focusExtension = editor.extensionManager.extensions.find(
            ext => ext.name === 'focus'
          );
          
          if (focusExtension && settings.mode !== 'off') {
            console.log('🎯 TipTap Settings: Applying focus mode', settings);
            // Update focus extension if needed
          }
        } catch (error) {
          console.error('TipTap Settings: Error parsing focus settings:', error);
        }
      }
    };

    // Apply focus mode with a small delay to ensure editor is ready
    setTimeout(applyFocusMode, 200);

    const handleFocusChange = (e: StorageEvent) => {
      if (e.key === 'tiptap-focus-mode-settings') {
        applyFocusMode();
      }
    };

    window.addEventListener('storage', handleFocusChange);
    return () => window.removeEventListener('storage', handleFocusChange);
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

// Prevent fast refresh warning by ensuring this is not treated as a component module  
const _integrationComponentName = 'TiptapSettingsIntegration';