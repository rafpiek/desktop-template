'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { type TypewriterMode } from '@/hooks/use-typewriter';

export interface TypewriterOptions {
  mode: TypewriterMode;
}

// Plugin key for typewriter functionality
const typewriterPluginKey = new PluginKey('typewriter');

// Typewriter extension for TipTap that centers the active block
export const TypewriterExtension = Extension.create<TypewriterOptions>({
  name: 'typewriter',

  addOptions() {
    return {
      mode: 'off',
    };
  },

  addProseMirrorPlugins() {
    const { mode } = this.options;

    return [
      new Plugin({
        key: typewriterPluginKey,
        
        view(editorView) {
          return new TypewriterView(editorView, mode);
        },

        props: {
          handleKeyDown(view, event) {
            // Center on specific keys when typewriter is active
            if (mode === 'off') return false;
            if (event.shiftKey) return false; // Don't center while extending selection

            const keysToCenter = new Set([
              'Enter',
              'Backspace',
              'Delete',
              'ArrowUp',
              'ArrowDown',
              'ArrowLeft', 
              'ArrowRight',
              'Home',
              'End',
              'PageUp',
              'PageDown'
            ]);

            if (keysToCenter.has(event.key)) {
              // Center after a short delay to let the DOM update
              setTimeout(() => {
                const typewriterView = typewriterPluginKey.getState(view.state);
                if (typewriterView) {
                  centerActiveBlock(view, mode);
                }
              }, 10);
            }

            return false;
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem'],
        attributes: {
          'data-typewriter': {
            default: null,
            parseHTML: (element) => element.getAttribute('data-typewriter'),
            renderHTML: (attributes) => {
              if (!attributes['data-typewriter']) return {};
              return { 'data-typewriter': attributes['data-typewriter'] };
            },
          },
        },
      },
    ];
  },
});

// TypewriterView class to handle the typewriter functionality
class TypewriterView {
  private view: EditorView;
  private mode: TypewriterMode;
  private rafToken: number | null = null;
  private suppressSelectionUntil = 0;

  constructor(view: EditorView, mode: TypewriterMode) {
    this.view = view;
    this.mode = mode;

    // Listen for selection changes
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.view.dom.addEventListener('selectionchange', this.handleSelectionChange);
  }

  private handleSelectionChange() {
    if (this.mode === 'off') return;
    if (performance.now() < this.suppressSelectionUntil) return;

    // Cancel any pending animation frame
    if (this.rafToken) {
      cancelAnimationFrame(this.rafToken);
    }

    // Schedule centering for the next frame
    this.rafToken = requestAnimationFrame(() => {
      this.updateActiveBlockHighlight();
      centerActiveBlock(this.view, this.mode);
      this.rafToken = null;
    });
  }

  private updateActiveBlockHighlight() {
    if (this.mode === 'off') return;

    // Remove existing active class
    const existingActive = document.querySelector('.typewriter-active .tw-active');
    if (existingActive) {
      existingActive.classList.remove('tw-active');
    }

    // Find current active block and highlight it
    const { selection } = this.view.state;
    if (selection.empty) {
      const pos = selection.from;
      const resolvedPos = this.view.state.doc.resolve(pos);
      
      // Find the block-level node
      let depth = resolvedPos.depth;
      while (depth > 0) {
        const node = resolvedPos.node(depth);
        if (node.type.spec.group?.includes('block')) {
          break;
        }
        depth--;
      }

      // Find the corresponding DOM element
      const domPos = this.view.domAtPos(resolvedPos.start(depth));
      let blockElement = domPos.node;
      
      // Navigate to the actual block element
      while (blockElement && blockElement.nodeType !== Node.ELEMENT_NODE) {
        blockElement = blockElement.parentNode;
      }
      
      if (blockElement && blockElement.nodeType === Node.ELEMENT_NODE) {
        (blockElement as Element).classList.add('tw-active');
      }
    }
  }

  public updateMode(newMode: TypewriterMode) {
    this.mode = newMode;
    
    if (newMode === 'off') {
      // Clean up when disabling
      const active = document.querySelector('.typewriter-active .tw-active');
      if (active) active.classList.remove('tw-active');
      
      if (this.rafToken) {
        cancelAnimationFrame(this.rafToken);
        this.rafToken = null;
      }
    } else {
      // Immediately apply when enabling
      this.handleSelectionChange();
    }
  }

  public destroy() {
    this.view.dom.removeEventListener('selectionchange', this.handleSelectionChange);
    
    if (this.rafToken) {
      cancelAnimationFrame(this.rafToken);
    }

    // Clean up active highlighting
    const active = document.querySelector('.typewriter-active .tw-active');
    if (active) active.classList.remove('tw-active');
  }
}

// Core function to center the active block (adapted from original implementation)
function centerActiveBlock(view: EditorView, mode: TypewriterMode) {
  if (mode === 'off') return;
  
  const { selection } = view.state;
  if (!selection.empty) return; // Only center when cursor is collapsed

  try {
    // Find the active block element
    const activeElement = document.querySelector('.typewriter-active .tw-active') as HTMLElement;
    if (!activeElement) return;

    // Find the scroll container
    const scrollContainer = findScrollContainer(activeElement);
    if (!scrollContainer) return;

    const elementRect = activeElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    // Calculate center position
    const elementCenter = elementRect.top + elementRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    const offset = elementCenter - containerCenter;

    // Apply smooth scroll to center the element
    scrollContainer.scrollBy({
      top: offset,
      behavior: 'smooth',
    });

    console.log('🎯 TipTap Typewriter: Centered active block');
  } catch (error) {
    console.error('TipTap Typewriter: Error centering block:', error);
  }
}

// Find the scrollable container (adapted from original implementation)
function findScrollContainer(element: HTMLElement | null): HTMLElement | null {
  let current = element;
  
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflow = style.overflow + style.overflowY + style.overflowX;
    
    if (overflow.includes('scroll') || overflow.includes('auto')) {
      // Check if it actually has scrollable content
      if (current.scrollHeight > current.clientHeight || 
          current.scrollWidth > current.clientWidth) {
        return current;
      }
    }
    current = current.parentElement;
  }
  
  return document.documentElement; // Fallback to document scroll
}

// Kit that exports the typewriter extension
export const TypewriterTiptapKit = [
  TypewriterExtension.configure({
    mode: 'off', // Default mode, will be updated dynamically
  }),
];

// Prevent fast refresh warning by ensuring this is not treated as a component module
const _typewriterExtensionName = TypewriterExtension.name;