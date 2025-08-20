'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiptapDragHandleProps {
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
  visible?: boolean;
}

export function TiptapDragHandle({
  onDragStart,
  onDragEnd,
  className,
  visible = true,
}: TiptapDragHandleProps) {
  return (
    <div
      className={cn(
        'tiptap-drag-handle',
        'absolute left-0 top-0 flex items-center justify-center',
        'w-5 h-5 -ml-6 cursor-grab active:cursor-grabbing',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'hover:bg-accent rounded',
        visible && 'opacity-100',
        className
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      contentEditable={false}
      title="Drag to move block"
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}