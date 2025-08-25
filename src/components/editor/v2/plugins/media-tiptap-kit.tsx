'use client';

import { Image } from '@tiptap/extension-image';
// Media kit for desktop template (images, etc.)
export const MediaTiptapKit = [
  Image.configure({
    HTMLAttributes: {
      class: 'tiptap-image max-w-full h-auto rounded-lg shadow-sm',
    },
    allowBase64: true,
    inline: false,
  }),
];