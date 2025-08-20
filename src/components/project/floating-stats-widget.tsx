import React, { useState, useEffect } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextStats {
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
}

interface FloatingStatsWidgetProps {
  textStats: TextStats;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

export function FloatingStatsWidget({ textStats, isVisible, onToggle }: FloatingStatsWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-floating-stats]') && isVisible) {
        // Don't auto-close, let user manually close it
        // onToggle(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onToggle]);

  if (!isVisible) {
    return (
      <div
        data-floating-stats
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => onToggle(true)}
          className={cn(
            "group relative flex items-center justify-center w-12 h-12",
            "bg-background/80 backdrop-blur-md border border-border/50",
            "rounded-full shadow-lg hover:shadow-xl",
            "transition-all duration-200 ease-in-out",
            "hover:scale-105 hover:bg-background/90"
          )}
          title="Show document stats"
        >
          <BarChart3 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div
      data-floating-stats
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative px-4 py-3 min-w-[200px]",
          "bg-background/80 backdrop-blur-md border border-border/50",
          "rounded-xl shadow-lg",
          "transition-all duration-200 ease-in-out",
          "hover:shadow-xl hover:bg-background/90"
        )}
      >
        {/* Close button - only visible on hover */}
        <button
          onClick={() => onToggle(false)}
          className={cn(
            "absolute -top-2 -right-2 w-6 h-6",
            "bg-background border border-border/50 rounded-full",
            "flex items-center justify-center",
            "transition-all duration-200 ease-in-out",
            "hover:bg-destructive hover:border-destructive hover:text-destructive-foreground",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <X className="w-3 h-3" />
        </button>

        {/* Stats content */}
        <div className="space-y-2">
          {/* Word count - primary metric */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Words</span>
            <span className="text-lg font-semibold text-foreground">
              {textStats.wordCount.toLocaleString()}
            </span>
          </div>

          {/* Character counts - secondary metrics */}
          {textStats.wordCount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">Characters</span>
                <span className="text-sm text-muted-foreground">
                  {textStats.charactersWithSpaces.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">No spaces</span>
                <span className="text-sm text-muted-foreground">
                  {textStats.charactersWithoutSpaces.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}