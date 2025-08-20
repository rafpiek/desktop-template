'use client';

import { Focus } from '@tiptap/extension-focus';
import { type Extension } from '@tiptap/core';

// Enhanced focus mode kit for typewriter experience with better integration
export const FocusModeTiptapKit: Extension[] = [
  Focus.configure({
    className: 'tiptap-focus',
    mode: 'singleNode',
    
    // Add custom CSS for focus styling
    addGlobalAttributes() {
      return [
        {
          types: ['paragraph', 'heading', 'blockquote'],
          attributes: {
            'data-focus': {
              default: null,
              parseHTML: (element) => element.getAttribute('data-focus'),
              renderHTML: (attributes) => {
                if (!attributes['data-focus']) return {};
                return { 'data-focus': attributes['data-focus'] };
              },
            },
          },
        },
      ];
    },
  }),
];