'use client';

import { Image } from '@tiptap/extension-image';
import { type Extension } from '@tiptap/core';

// Media kit for novel writers (images, etc.)
export const MediaTiptapKit: Extension[] = [
  Image.configure({
    HTMLAttributes: {
      class: 'tiptap-image max-w-full h-auto rounded-lg shadow-sm',
    },
    allowBase64: true,
    inline: false,
  }),
];