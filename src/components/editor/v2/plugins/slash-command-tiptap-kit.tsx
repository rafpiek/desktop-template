'use client';

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

import { SlashCommandMenu, type SlashCommandMenuRef } from '../slash-commands/slash-command-menu';
import { NOVEL_WRITER_SLASH_COMMANDS, searchCommands, type SlashCommand } from '../slash-commands/novel-writer-commands';

// Slash command extension using TipTap's suggestion
const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowedPrefixes: [' '],
        startOfLine: false,
        command: ({ editor, range, props }: { 
          editor: unknown; 
          range: unknown; 
          props: SlashCommand 
        }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        
        // Only trigger when a slash is typed, not when cursor is placed on existing slash
        allow: ({ editor, range }) => {
          // Check if we're at the beginning of the document or after a space
          const $pos = editor.state.doc.resolve(range.from);
          const textBefore = $pos.parent.textBetween(Math.max(0, $pos.parentOffset - 1), $pos.parentOffset, null, "\uFFFD");
          
          // Allow if we're at the start of the line or after a space
          return range.from === 0 || textBefore === ' ' || textBefore === '' || textBefore === '\n';
        },
        
        items: ({ query }: { query: string }) => {
          if (!query.trim()) {
            return NOVEL_WRITER_SLASH_COMMANDS;
          }
          return searchCommands(query);
        },

        render: () => {
          let component: ReactRenderer<SlashCommandMenuRef>;
          let popup: TippyInstance;

          return {
            onStart: (props: unknown) => {
              
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  ...props,
                  command: (item: SlashCommand) => {
                    item.command({ editor: props.editor, range: props.range });
                  },
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'slash-command',
                maxWidth: 'none',
                offset: [0, 8],
                zIndex: 9999,
              })[0];
            },

            onUpdate(props: unknown) {
              
              component?.updateProps({
                ...props,
                command: (item: SlashCommand) => {
                  item.command({ editor: props.editor, range: props.range });
                },
              });

              if (!props.clientRect) {
                return;
              }

              popup?.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: unknown) {
              if (props.event.key === 'Escape') {
                popup?.hide();
                return true;
              }

              if (component?.ref?.onKeyDown) {
                return component.ref.onKeyDown(props.event);
              }

              return false;
            },

            onExit() {
              popup?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});

// CSS styles for the slash command menu
const slashCommandStyles = `
  .tippy-box[data-theme~='slash-command'] {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  .tippy-box[data-theme~='slash-command'] .tippy-content {
    padding: 0;
  }
  
  .tiptap-slash-menu {
    font-family: inherit;
  }
`;

// Inject styles when the extension is used
if (typeof document !== 'undefined' && !document.getElementById('slash-command-styles')) {
  const style = document.createElement('style');
  style.id = 'slash-command-styles';
  style.textContent = slashCommandStyles;
  document.head.appendChild(style);
}

export const SlashCommandTiptapKit: Extension[] = [SlashCommand];