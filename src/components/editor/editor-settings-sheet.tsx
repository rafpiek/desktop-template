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

export function EditorSettingsSheet() {
  const { fontSize, setFontSize } = useFontSize();
  const { fontFamily, setFontFamily } = useFontFamily();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
