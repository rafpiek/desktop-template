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
    const extension = this;

    return [
      new Plugin({
        key: typewriterPluginKey,

        state: {
          init() {
            return new TypewriterView(null, extension.options.mode);
          },
          apply(tr, pluginState, oldState, newState) {
            // Check if mode has changed
            const currentMode = extension.options.mode;
            if (pluginState && pluginState.mode !== currentMode) {
              pluginState.updateMode(currentMode);
            }

            // Check if selection changed
            if (pluginState && currentMode !== 'off' && !oldState.selection.eq(newState.selection)) {
              // Schedule update for next frame
              setTimeout(() => {
                if (pluginState && pluginState.view) {
                  pluginState.handleSelectionChange();
                }
              }, 0);
            }

            return pluginState;
          }
        },

        view(editorView) {
          const pluginState = typewriterPluginKey.getState(editorView.state);
          if (pluginState) {
            pluginState.setView(editorView);

            // Listen for typewriter settings changes
            const handleTypewriterChange = () => {
              try {
                const stored = localStorage.getItem('typewriter-settings');
                if (stored) {
                  const settings = JSON.parse(stored);
                  const newMode = settings.mode || 'off';

                  // Update extension options
                  extension.options.mode = newMode;

                  // Update plugin state
                  if (pluginState) {
                    pluginState.updateMode(newMode);
                  }

                }
              } catch (error) {
              }
            };

            // Add event listener
            window.addEventListener('tiptap-typewriter-change', handleTypewriterChange);

            // Store cleanup function on the plugin state
            pluginState.cleanup = () => {
              window.removeEventListener('tiptap-typewriter-change', handleTypewriterChange);
            };
          }
          return pluginState;
        },

        props: {
          handleKeyDown(view, event) {
            const pluginState = typewriterPluginKey.getState(view.state);
            if (!pluginState || pluginState.mode === 'off') return false;
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
                if (pluginState && pluginState.view) {
                  pluginState.updateActiveBlockHighlight();
                  centerActiveBlock(view, pluginState.mode);
                }
              }, 10);
            }

            return false;
          },

          // Add handleDOMEvents to catch all selection changes
          handleDOMEvents: {
            selectionchange: (view) => {
              const pluginState = typewriterPluginKey.getState(view.state);
              if (pluginState && pluginState.mode !== 'off') {
                pluginState.handleSelectionChange();
              }
              return false;
            },

            click: (view) => {
              const pluginState = typewriterPluginKey.getState(view.state);
              if (pluginState && pluginState.mode !== 'off') {
                setTimeout(() => {
                  pluginState.handleSelectionChange();
                }, 10);
              }
              return false;
            },

            input: (view) => {
              const pluginState = typewriterPluginKey.getState(view.state);
              if (pluginState && pluginState.mode !== 'off') {
                setTimeout(() => {
                  pluginState.handleSelectionChange();
                }, 50);
              }
              return false;
            },

            keyup: (view) => {
              const pluginState = typewriterPluginKey.getState(view.state);
              if (pluginState && pluginState.mode !== 'off') {
                // Only handle if not already handled by handleKeyDown
                const key = (event as KeyboardEvent).key;
                if (!['Enter', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                  setTimeout(() => {
                    pluginState.handleSelectionChange();
                  }, 10);
                }
              }
              return false;
            }
          }
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
  public view: EditorView | null;
  public mode: TypewriterMode;
  public cleanup?: () => void;
  private rafToken: number | null = null;
  private suppressSelectionUntil = 0;

  constructor(view: EditorView | null, mode: TypewriterMode) {
    this.view = view;
    this.mode = mode;

    // Bind the method
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

      setView(view: EditorView) {
    this.view = view;

    // Delay initialization to ensure DOM is fully ready
    if (this.view) {
      setTimeout(() => {
        // Setup dynamic padding for typewriter mode
        this.updateScrollPadding();

        // Immediately update if mode is active
        if (this.mode !== 'off' && this.view && (this.view as any).docView) {
          this.handleSelectionChange();
        }
      }, 200); // Increased delay to ensure DOM is ready
    }
  }

  private updateScrollPadding() {
    if (!this.view) return;

    // Find the scroll container
    const scrollContainer = findScrollContainer(this.view.dom as HTMLElement);
    if (!scrollContainer) return;

    if (this.mode !== 'off') {
      // Add padding to allow centering at the top and bottom
      const viewportHeight = scrollContainer.clientHeight;
      const halfViewport = Math.floor(viewportHeight / 2);

      // Apply padding using CSS custom properties for smooth transitions
      scrollContainer.style.setProperty('--typewriter-padding-top', `${halfViewport}px`);
      scrollContainer.style.setProperty('--typewriter-padding-bottom', `${halfViewport}px`);
      scrollContainer.style.paddingTop = `var(--typewriter-padding-top)`;
      scrollContainer.style.paddingBottom = `var(--typewriter-padding-bottom)`;
    } else {
      // Remove padding when typewriter is off
      scrollContainer.style.removeProperty('--typewriter-padding-top');
      scrollContainer.style.removeProperty('--typewriter-padding-bottom');
      scrollContainer.style.paddingTop = '';
      scrollContainer.style.paddingBottom = '';
    }
  }

  public handleSelectionChange() {
    if (this.mode === 'off' || !this.view) return;
    if (performance.now() < this.suppressSelectionUntil) return;

    // Cancel any pending animation frame
    if (this.rafToken) {
      cancelAnimationFrame(this.rafToken);
    }

    // Schedule centering for the next frame
    this.rafToken = requestAnimationFrame(() => {
      if (this.view && (this.view as any).docView) {
        this.updateActiveBlockHighlight();
        centerActiveBlock(this.view, this.mode);
      } else {
      }
      this.rafToken = null;
    });
  }

    private updateActiveBlockHighlight() {
    if (this.mode === 'off' || !this.view) return;


    // Remove existing active class (check both with and without parent)
    const existingActive = document.querySelector('.tw-active');
    if (existingActive) {
      existingActive.classList.remove('tw-active');
    }

    // Find current active block and highlight it
    const { selection } = this.view.state;
    if (selection.empty) {
      const pos = selection.from;
      const resolvedPos = this.view.state.doc.resolve(pos);


      // Get the position of the current block
      let blockPos = pos;
      let blockNode = null;

      // Find the parent block node
      for (let d = resolvedPos.depth; d >= 0; d--) {
        const node = d === resolvedPos.depth ? resolvedPos.parent : resolvedPos.node(d);
        if (node.isBlock && (node.type.name === 'paragraph' ||
                             node.type.name === 'heading' ||
                             node.type.name === 'blockquote' ||
                             node.type.name === 'listItem')) {
          blockNode = node;
          blockPos = d === resolvedPos.depth ? resolvedPos.start() - 1 : resolvedPos.before(d + 1);
          break;
        }
      }

            if (blockPos >= 0) {
        // Find the corresponding DOM element
        try {
          // Check if view is ready for DOM operations
          if (!(this.view as any).docView) {
            return;
          }

          // Use a more reliable position - the actual start of the block content
          const actualPos = blockPos === 0 ? 1 : blockPos + 1;
          const domPos = this.view.domAtPos(actualPos);
          let blockElement: Node | null = domPos.node;


          // If we got a text node, get its parent element
          if (blockElement && blockElement.nodeType === Node.TEXT_NODE) {
            blockElement = blockElement.parentElement;
          }

          // Find the actual block element (p, h1-h6, etc.)
          // Start from the element and go up until we find a block element
          while (blockElement && blockElement !== this.view.dom) {
            const tagName = (blockElement as Element).tagName?.toLowerCase();

            // Check if this is a block-level element
            if (tagName && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li'].includes(tagName)) {
              (blockElement as Element).classList.add('tw-active');
              break;
            }

            // Also check if it has a data attribute that indicates it's a tiptap heading
            if ((blockElement as Element).hasAttribute?.('data-level')) {
              (blockElement as Element).classList.add('tw-active');
              break;
            }

            blockElement = (blockElement as Element).parentElement;
          }

          if (!blockElement || blockElement === this.view.dom) {
          }
        } catch (error) {
        }
      }
    }
  }

  public updateMode(newMode: TypewriterMode) {
    this.mode = newMode;

    // Update scroll padding
    this.updateScrollPadding();

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
    if (this.rafToken) {
      cancelAnimationFrame(this.rafToken);
    }

    // Clean up event listeners
    if (this.cleanup) {
      this.cleanup();
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
    let activeElement = document.querySelector('.typewriter-active .tw-active') as HTMLElement;
    if (!activeElement) {
      // Fallback: try finding just .tw-active without parent check
      activeElement = document.querySelector('.tw-active') as HTMLElement;
      if (!activeElement) {
        return;
      } else {
      }
    }

    // Find the scroll container
    const scrollContainer = findScrollContainer(activeElement);
    if (!scrollContainer) {
      return;
    }

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

  } catch (error) {
  }
}

// Find the scrollable container - specifically look for the editor scroll container
function findScrollContainer(element: HTMLElement | null): HTMLElement | null {
  // First, try to find the editor-specific scroll container by class
  const editorScroll = document.querySelector('.editor-scroll') as HTMLElement;
  if (editorScroll) {
    return editorScroll;
  }

  // Try to find it relative to the element
  const editorScrollRelative = element?.closest('.editor-scroll') as HTMLElement;
  if (editorScrollRelative) {
    return editorScrollRelative;
  }

  // Fallback: look for the tiptap-content container with overflow
  const tiptapContent = document.querySelector('.tiptap-content.overflow-y-auto') as HTMLElement;
  if (tiptapContent) {
    return tiptapContent;
  }

  // Try relative to element
  const tiptapContentRelative = element?.closest('.tiptap-content') as HTMLElement;
  if (tiptapContentRelative) {
    const style = window.getComputedStyle(tiptapContentRelative);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return tiptapContentRelative;
    }
  }

  // Last resort: look for any overflow container within the editor
  let current = element;
  while (current && current !== document.body) {
    // Stop if we reach the editor boundary
    if (current.classList.contains('tiptap-editor-container') ||
        current.classList.contains('editor')) {
      // Don't go beyond the editor container
      const style = window.getComputedStyle(current);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return current;
      }
      break; // Don't scroll anything outside the editor
    }

    const style = window.getComputedStyle(current);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }

  return null; // Don't scroll the document
}

// Function that creates the typewriter kit with current settings
export const createTypewriterTiptapKit = () => {
  // Read current mode from localStorage at initialization time
  let currentMode: TypewriterMode = 'off';
  try {
    const stored = localStorage.getItem('typewriter-settings');
    if (stored) {
      const settings = JSON.parse(stored);
      currentMode = settings.mode || 'off';
    }
  } catch (error) {
    currentMode = 'off';
  }

  return [
    TypewriterExtension.configure({
      mode: currentMode,
    }),
  ];
};

// For backward compatibility, export the kit with default settings
export const TypewriterTiptapKit = createTypewriterTiptapKit();

// Prevent fast refresh warning by ensuring this is not treated as a component module
const _typewriterExtensionName = TypewriterExtension.name;
