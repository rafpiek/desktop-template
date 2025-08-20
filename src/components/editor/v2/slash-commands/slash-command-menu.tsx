'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  NOVEL_WRITER_SLASH_COMMANDS,
  COMMAND_CATEGORIES,
  searchCommands,
  getCommandsByCategory,
  type SlashCommand
} from './novel-writer-commands';

interface SlashCommandMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
  query?: string;
}

export interface SlashCommandMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command, query = '' }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [filteredItems, setFilteredItems] = useState<SlashCommand[]>(NOVEL_WRITER_SLASH_COMMANDS);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const { categorizedItems, displayOrderItems } = React.useMemo(() => {
      const grouped: Record<string, SlashCommand[]> = {};
      const displayOrder: SlashCommand[] = [];

      COMMAND_CATEGORIES.forEach(category => {
        const categoryItems = filteredItems.filter(item => item.category === category.id);
        grouped[category.id] = categoryItems;
        displayOrder.push(...categoryItems);
      });

      return {
        categorizedItems: grouped,
        displayOrderItems: displayOrder
      };
    }, [filteredItems]);
    // Filter items based on query
    useEffect(() => {
      if (query.trim()) {
        const searched = searchCommands(query);
        setFilteredItems(searched);
      } else {
        setFilteredItems(NOVEL_WRITER_SLASH_COMMANDS);
      }
      setSelectedIndex(0);
    }, [query]);

    // Ensure selectedIndex is within bounds
    useEffect(() => {
      if (selectedIndex >= displayOrderItems.length) {
        setSelectedIndex(Math.max(0, displayOrderItems.length - 1));
      }
    }, [displayOrderItems, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
      if (menuRef.current) {
        const selectedElement = menuRef.current.querySelector(`[data-selected-index="${selectedIndex}"]`) as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }, [selectedIndex]);

    const selectItem = useCallback((index: number) => {
      const item = displayOrderItems[index];
      if (item) {
        command(item);
      }
    }, [displayOrderItems, command]);

    const upHandler = useCallback(() => {
      setSelectedIndex((prevIndex) =>
        prevIndex <= 0 ? displayOrderItems.length - 1 : prevIndex - 1
      );
    }, [displayOrderItems]);

    const downHandler = useCallback(() => {
      setSelectedIndex((prevIndex) =>
        prevIndex >= displayOrderItems.length - 1 ? 0 : prevIndex + 1
      );
    }, [displayOrderItems]);

    const enterHandler = useCallback(() => {
      selectItem(selectedIndex);
    }, [selectItem, selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent): boolean => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }), [upHandler, downHandler, enterHandler]);

    // Group items by category for display and create display order array


    if (filteredItems.length === 0) {
      return (
        <div className="tiptap-slash-menu bg-popover border border-border rounded-lg shadow-lg p-2 max-w-sm">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No commands found for "{query}"
          </div>
        </div>
      );
    }

    return (
      <div
        ref={menuRef}
        className="tiptap-slash-menu bg-popover border border-border rounded-lg shadow-lg p-1 max-w-sm max-h-80 overflow-y-auto"
      >
        {/* Search hint */}
        {query.trim() && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
            Searching for "{query}"
          </div>
        )}

        {/* Render by categories */}
        {COMMAND_CATEGORIES.map(category => {
          const categoryItems = categorizedItems[category.id];
          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id} className="py-1">
              {/* Category header (only show if not searching) */}
              {!query.trim() && (
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {category.label}
                </div>
              )}

              {/* Category items */}
              {categoryItems.map((item, index) => {
                // Calculate global index for selection in display order
                const globalIndex = displayOrderItems.indexOf(item);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={`${item.title}-${item.category}`}
                    data-selected-index={isSelected ? selectedIndex : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => selectItem(globalIndex)}
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Navigation hint */}
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            ↑↓ to navigate • ↵ to select • ESC to cancel
          </span>
        </div>
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
