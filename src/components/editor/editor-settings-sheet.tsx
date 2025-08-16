import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useFontSize, type FontSize } from '@/hooks/use-font-size';
import { useFontFamily, type FontFamily } from '@/hooks/use-font-family';
import { cn } from '@udecode/cn';

interface FontSizeOption {
  value: FontSize;
  label: string;
  preview: string;
  description: string;
}

interface FontFamilyOption {
  value: FontFamily;
  label: string;
  preview: string;
  description: string;
  className: string;
}

interface LineWidthOption {
  value: LineWidth;
  label: string;
  preview: string;
  description: string;
}

type LineWidth = '60' | '80' | '120' | '160' | 'full' | 'default';

const fontSizeOptions: FontSizeOption[] = [
  {
    value: 'xs',
    label: 'Extra Small',
    preview: 'Aa',
    description: 'Maximum density (12px base)'
  },
  {
    value: 'sm',
    label: 'Small',
    preview: 'Aa',
    description: 'Compact reading (14px base)'
  },
  {
    value: 'md',
    label: 'Medium',
    preview: 'Aa',
    description: 'Balanced default (16px base)'
  },
  {
    value: 'lg',
    label: 'Large',
    preview: 'Aa',
    description: 'Comfortable editing (18px base)'
  },
  {
    value: 'zen',
    label: 'Zen',
    preview: 'Aa',
    description: 'Focus mode (22px base)'
  },
];

const fontFamilyOptions: FontFamilyOption[] = [
  {
    value: 'sans',
    label: 'Sans Serif',
    preview: 'Aa Bb Cc',
    description: 'Clean and modern',
    className: 'font-family-sans'
  },
  {
    value: 'serif',
    label: 'Serif',
    preview: 'Aa Bb Cc',
    description: 'Classic and elegant',
    className: 'font-family-serif'
  },
  {
    value: 'mono',
    label: 'Monospace',
    preview: 'Aa Bb Cc',
    description: 'Code-like appearance',
    className: 'font-family-mono'
  },
  {
    value: 'ia-mono',
    label: 'iA Writer Mono',
    preview: 'Aa Bb Cc',
    description: 'Typewriter style',
    className: 'font-family-ia-mono'
  },
  {
    value: 'ia-duo',
    label: 'iA Writer Duo',
    preview: 'Aa Bb Cc',
    description: 'Variable width typewriter',
    className: 'font-family-ia-duo'
  },
  {
    value: 'typewriter',
    label: 'Typewriter',
    preview: 'Aa Bb Cc',
    description: 'Classic typewriter font',
    className: 'font-family-typewriter'
  },
];

const lineWidthOptions: LineWidthOption[] = [
  {
    value: 'default',
    label: 'Default',
    preview: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    description: 'No width limit'
  },
  {
    value: '60',
    label: 'Narrow',
    preview: '━━━━━━━━━━━━━━━━━━━━',
    description: '60 characters wide'
  },
  {
    value: '80',
    label: 'Compact',
    preview: '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    description: '80 characters wide'
  },
  {
    value: '120',
    label: 'Comfortable',
    preview: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    description: '120 characters wide'
  },
  {
    value: '160',
    label: 'Wide',
    preview: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    description: '160 characters wide'
  },
  {
    value: 'full',
    label: 'Full Width',
    preview: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    description: 'Use all available space'
  }
];

export function EditorSettingsSheet() {
  // Get current values directly from DOM/localStorage
  const getCurrentFontSize = (): FontSize => {
    const saved = localStorage.getItem('zeyn-font-size');
    return (saved as FontSize) || 'md';
  };
  
  const getCurrentFontFamily = (): FontFamily => {
    const saved = localStorage.getItem('zeyn-font-family');
    return (saved as FontFamily) || 'sans';
  };
  
  const getCurrentLineWidth = (): LineWidth => {
    const saved = localStorage.getItem('zeyn-line-width');
    return (saved as LineWidth) || 'default';
  };
  
  const [fontSize, setCurrentFontSize] = React.useState(getCurrentFontSize());
  const [fontFamily, setCurrentFontFamily] = React.useState(getCurrentFontFamily());
  const [lineWidth, setCurrentLineWidth] = React.useState(getCurrentLineWidth());
  
  const setFontSize = (size: FontSize) => {
    // Update localStorage
    localStorage.setItem('zeyn-font-size', size);
    setCurrentFontSize(size);
    
    // Apply to DOM directly
    const editors = document.querySelectorAll('.editor');
    editors.forEach(editor => {
      // Remove old font-size classes
      editor.classList.remove('font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-zen');
      // Add new class
      editor.classList.add(`font-size-${size}`);
    });
  };
  
  const setFontFamily = (family: FontFamily) => {
    // Update localStorage  
    localStorage.setItem('zeyn-font-family', family);
    setCurrentFontFamily(family);
    
    // Apply to DOM directly
    const editors = document.querySelectorAll('.editor');
    editors.forEach(editor => {
      // Remove old font-family classes
      editor.classList.remove('font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter');
      // Add new class
      editor.classList.add(`font-family-${family}`);
    });
  };
  
  const setLineWidth = (width: LineWidth) => {
    // Update localStorage
    localStorage.setItem('zeyn-line-width', width);
    setCurrentLineWidth(width);
    
    // Apply to DOM directly
    const editors = document.querySelectorAll('.editor');
    editors.forEach(editor => {
      // Remove old line-width classes
      editor.classList.remove('line-width-60', 'line-width-80', 'line-width-120', 'line-width-160', 'line-width-full', 'line-width-default');
      // Add new class
      editor.classList.add(`line-width-${width}`);
    });
  };
  
  // Apply stored settings on mount and when editor appears
  React.useEffect(() => {
    const applyStoredSettings = () => {
      const storedSize = getCurrentFontSize();
      const storedFamily = getCurrentFontFamily();
      const storedWidth = getCurrentLineWidth();
      
      const editors = document.querySelectorAll('.editor');
      editors.forEach(editor => {
        // Apply font size
        editor.classList.remove('font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-zen');
        editor.classList.add(`font-size-${storedSize}`);
        
        // Apply font family
        editor.classList.remove('font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter');
        editor.classList.add(`font-family-${storedFamily}`);
        
        // Apply line width
        editor.classList.remove('line-width-60', 'line-width-80', 'line-width-120', 'line-width-160', 'line-width-full', 'line-width-default');
        editor.classList.add(`line-width-${storedWidth}`);
      });
    };
    
    // Apply immediately
    applyStoredSettings();
    
    // Also apply when new editors are added (with a small delay)
    const observer = new MutationObserver(() => {
      setTimeout(applyStoredSettings, 100);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>Editor Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Font Size Section */}
          <div>
            <h3 className="mb-4 text-sm font-medium">Font Size</h3>
            <div className="space-y-3">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    fontSize === option.value
                      ? 'border-primary bg-accent'
                      : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 transition-colors',
                      fontSize === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}>
                      {fontSize === option.value && (
                        <div className="w-full h-full rounded-full scale-50 bg-background" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'text-2xl font-serif transition-all',
                      option.value === 'xs' && 'text-base',
                      option.value === 'sm' && 'text-lg',
                      option.value === 'md' && 'text-xl',
                      option.value === 'lg' && 'text-2xl',
                      option.value === 'zen' && 'text-3xl'
                    )}
                  >
                    {option.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Section */}
          <div className="pt-4 border-t">
            <h3 className="mb-4 text-sm font-medium">Font Family</h3>
            <div className="space-y-3">
              {fontFamilyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontFamily(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    fontFamily === option.value
                      ? 'border-primary bg-accent'
                      : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 transition-colors',
                      fontFamily === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}>
                      {fontFamily === option.value && (
                        <div className="w-full h-full rounded-full scale-50 bg-background" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <div className={cn('text-lg', option.className)}>
                    {option.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Line Width Section */}
          <div className="pt-4 border-t">
            <h3 className="mb-4 text-sm font-medium">Line Width</h3>
            <div className="space-y-4">
              {/* Slider Container */}
              <div className="relative px-2">
                {/* Slider Track */}
                <div 
                  className="h-2 bg-muted rounded-full relative cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const index = Math.round(percentage * (lineWidthOptions.length - 1));
                    const clampedIndex = Math.max(0, Math.min(lineWidthOptions.length - 1, index));
                    setLineWidth(lineWidthOptions[clampedIndex].value);
                  }}
                >
                  {/* Slider Segments (Clickable) */}
                  {lineWidthOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={cn(
                        'absolute top-0 h-2 transition-colors rounded-full',
                        'hover:bg-accent-foreground/20',
                        lineWidth === option.value && 'bg-primary'
                      )}
                      style={{
                        left: `${(index / (lineWidthOptions.length - 1)) * 100}%`,
                        width: index === lineWidthOptions.length - 1 ? '0%' : `${100 / (lineWidthOptions.length - 1)}%`,
                        transform: index === lineWidthOptions.length - 1 ? 'translateX(-100%)' : 'none'
                      }}
                    />
                  ))}
                  
                  {/* Slider Dots/Markers */}
                  {lineWidthOptions.map((option, index) => (
                    <div
                      key={`dot-${option.value}`}
                      className="absolute top-1/2 w-1.5 h-1.5 bg-muted-foreground/40 rounded-full transform -translate-y-1/2"
                      style={{
                        left: `${(index / (lineWidthOptions.length - 1)) * 100}%`,
                        transform: 'translateX(-50%) translateY(-50%)'
                      }}
                    />
                  ))}
                  
                  {/* Slider Handle */}
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-sm transition-all transform -translate-y-1/2 cursor-pointer hover:scale-110 z-10"
                    style={{
                      left: `${(lineWidthOptions.findIndex(opt => opt.value === lineWidth) / (lineWidthOptions.length - 1)) * 100}%`,
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  />
                </div>
                
                {/* Slider Labels */}
                <div className="flex justify-between mt-3 px-1">
                  {lineWidthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLineWidth(option.value)}
                      className={cn(
                        'text-xs transition-colors cursor-pointer hover:text-foreground text-center',
                        lineWidth === option.value 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Selection Info */}
              <div className="text-center">
                <div className="text-sm font-medium">
                  {lineWidthOptions.find(opt => opt.value === lineWidth)?.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lineWidthOptions.find(opt => opt.value === lineWidth)?.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
