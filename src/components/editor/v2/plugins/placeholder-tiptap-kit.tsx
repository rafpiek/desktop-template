'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// Simple placeholder extension for TipTap
export const PlaceholderExtension = Extension.create({
  name: 'placeholder',

  addOptions() {
    return {
      placeholder: 'Start writing...',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: (state) => {
            const doc = state.doc;
            const { placeholder, showOnlyWhenEditable } = this.options;

            if (showOnlyWhenEditable && !this.editor.isEditable) {
              return null;
            }

            if (doc.content.size > 0) {
              return null;
            }

            // Check if document is empty
            const isEmpty = doc.textContent === '';
            if (!isEmpty) {
              return null;
            }

            const placeholderElement = document.createElement('div');
            placeholderElement.className = 'tiptap-placeholder';
            placeholderElement.innerHTML = placeholder;
            placeholderElement.style.cssText = `
              color: hsl(var(--muted-foreground));
              pointer-events: none;
              user-select: none;
              position: absolute;
              top: 0;
              left: 0;
              font-size: inherit;
              line-height: inherit;
            `;

            return null; // Let CSS handle the placeholder
          },
        },
      }),
    ];
  },
});

// Export as a function to avoid fast refresh issues
export const getPlaceholderTiptapKit = () => [PlaceholderExtension.configure({
  placeholder: 'Start writing...',
})];

// Legacy export for compatibility
export const PlaceholderTiptapKit = getPlaceholderTiptapKit();