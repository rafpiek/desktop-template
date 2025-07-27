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
import { cn } from '@udecode/cn';

interface FontSizeOption {
  value: FontSize;
  label: string;
  preview: string;
  description: string;
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

export function EditorSettingsSheet() {
  const { fontSize, setFontSize } = useFontSize();

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

          {/* Future sections placeholder */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              More settings coming soon...
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
