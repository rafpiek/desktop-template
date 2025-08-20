'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { type Extension as ExtensionType } from '@tiptap/core';

// Simple drag and drop plugin for TipTap
const DragDropPlugin = Extension.create({
  name: 'dragDrop',

  addOptions() {
    return {
      // Block types that should have drag handles
      dragHandleBlocks: ['paragraph', 'heading', 'blockquote', 'horizontalRule', 'image'],
    };
  },

  addProseMirrorPlugins() {
    const { dragHandleBlocks } = this.options;

    return [
      new Plugin({
        key: new PluginKey('dragDrop'),
        
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            
            state.doc.descendants((node, pos) => {
              // Only add decorations for top-level blocks
              if (dragHandleBlocks.includes(node.type.name) && pos >= 0) {
                const decoration = Decoration.widget(
                  pos,
                  () => {
                    const handle = document.createElement('div');
                    handle.className = 'tiptap-drag-handle-widget absolute left-0 w-5 h-5 -ml-6 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-grab';
                    handle.contentEditable = 'false';
                    handle.draggable = true;
                    handle.title = 'Drag to move block';
                    
                    // Add grip icon
                    handle.innerHTML = `
                      <svg class="h-3 w-3 text-muted-foreground m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h.01M8 10h.01M8 14h.01M8 18h.01M12 6h.01M12 10h.01M12 14h.01M12 18h.01M16 6h.01M16 10h.01M16 14h.01M16 18h.01" />
                      </svg>
                    `;
                    
                    // Add drag event listeners
                    handle.addEventListener('dragstart', (e) => {
                      e.dataTransfer?.setData('text/plain', pos.toString());
                      
                      // Add visual feedback
                      handle.style.cursor = 'grabbing';
                      
                      // Add drag feedback to the node
                      const nodeElement = handle.closest('[data-drag-node]') as HTMLElement;
                      if (nodeElement) {
                        nodeElement.style.opacity = '0.5';
                        nodeElement.classList.add('dragging');
                      }
                    });
                    
                    handle.addEventListener('dragend', () => {
                      handle.style.cursor = 'grab';
                      
                      // Remove drag feedback
                      const nodeElement = handle.closest('[data-drag-node]') as HTMLElement;
                      if (nodeElement) {
                        nodeElement.style.opacity = '';
                        nodeElement.classList.remove('dragging');
                      }
                    });
                    
                    return handle;
                  },
                  {
                    side: -1,
                    key: `drag-handle-${pos}`,
                  }
                );
                
                decorations.push(decoration);
              }
            });
            
            return DecorationSet.create(state.doc, decorations);
          },
          
          // Handle drop events
          handleDrop: (view, event, slice, moved) => {
            
            // For now, let the default behavior handle it
            // TODO: Implement custom drop logic for better UX
            return false;
          },
          
          // Add drag data attributes to nodes for styling
          nodeViews: {},
        },
        
        // Add CSS when plugin is initialized
        view() {
          // Inject CSS for drag handles
          const styleId = 'tiptap-drag-drop-styles';
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
              .ProseMirror [data-drag-node] {
                position: relative;
              }
              
              .ProseMirror [data-drag-node]:hover .tiptap-drag-handle-widget {
                opacity: 1;
              }
              
              .ProseMirror [data-drag-node].dragging {
                opacity: 0.5;
                transform: rotate(5deg);
                transition: all 0.2s ease;
              }
              
              .tiptap-drag-handle-widget {
                z-index: 10;
                background: transparent;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.2s ease, background-color 0.2s ease;
              }
              
              .tiptap-drag-handle-widget:hover {
                background-color: hsl(var(--accent));
              }
              
              .tiptap-drag-handle-widget:active {
                cursor: grabbing;
              }
              
              /* Add drag node attributes to blocks for easier styling */
              .ProseMirror p,
              .ProseMirror h1,
              .ProseMirror h2,
              .ProseMirror h3,
              .ProseMirror h4,
              .ProseMirror h5,
              .ProseMirror h6,
              .ProseMirror blockquote,
              .ProseMirror hr,
              .ProseMirror img {
                position: relative;
              }
            `;
            document.head.appendChild(style);
          }
          
          return {
            destroy() {
              // Cleanup if needed
            }
          };
        },
      }),
    ];
  },
});

// Block selection plugin for multi-select (basic implementation)
const BlockSelectionPlugin = Extension.create({
  name: 'blockSelection',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockSelection'),
        
        props: {
          // Handle click events for block selection
          handleClick: (view, pos, event) => {
            // Check if Shift key is pressed for multi-select
            if (event.shiftKey) {
              // TODO: Implement multi-select logic
              return false;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export const DragDropTiptapKit: ExtensionType[] = [
  DragDropPlugin,
  BlockSelectionPlugin,
];