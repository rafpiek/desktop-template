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
import { type FontSize } from '@/hooks/use-font-size';
import { type FontFamily } from '@/hooks/use-font-family';
import { useTypewriter, type TypewriterMode } from '@/hooks/use-typewriter';
import { triggerTiptapTypewriterUpdate } from '@/hooks/use-tiptap-typewriter';
import { SettingsSlider } from '@/components/ui/settings-slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


type LineWidth = '60' | '80' | '120' | '160' | 'full' | 'default';

const typewriterOptions = [
  {
    value: 'off' as TypewriterMode,
    label: 'Off',
    description: 'Standard editor behavior',
    preview: <div className="text-xs font-mono text-muted-foreground">Aa</div>
  },
  {
    value: 'center' as TypewriterMode,
    label: 'Center',
    description: 'Keep the active line in the middle',
    preview: <div className="text-xs font-mono text-muted-foreground">Aa</div>
  },
];

const fontSizeOptions = [
  {
    value: 'xs' as FontSize,
    label: 'XS',
    description: 'Maximum density (12px base)',
    preview: <span className="text-xs font-serif">Aa</span>
  },
  {
    value: 'sm' as FontSize,
    label: 'SM',
    description: 'Compact reading (14px base)',
    preview: <span className="text-sm font-serif">Aa</span>
  },
  {
    value: 'md' as FontSize,
    label: 'MD',
    description: 'Balanced default (16px base)',
    preview: <span className="text-base font-serif">Aa</span>
  },
  {
    value: 'lg' as FontSize,
    label: 'LG',
    description: 'Comfortable editing (18px base)',
    preview: <span className="text-lg font-serif">Aa</span>
  },
  {
    value: 'zen' as FontSize,
    label: 'ZEN',
    description: 'Focus mode (22px base)',
    preview: <span className="text-xl font-serif">Aa</span>
  },
];

const fontFamilyOptions = [
  {
    value: 'system' as FontFamily,
    label: 'System',
    description: 'OS default',
    preview: <span className="text-base" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>Aa</span>
  },
  {
    value: 'roboto' as FontFamily,
    label: 'Roboto',
    description: 'Google Sans',
    preview: <span className="text-base" style={{ fontFamily: "'Roboto', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>Aa</span>
  },
  {
    value: 'times' as FontFamily,
    label: 'Times New Roman',
    description: 'Classic serif',
    preview: <span className="text-base" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Aa</span>
  },
  {
    value: 'ia-mono' as FontFamily,
    label: 'iA Writer Mono',
    description: 'Clean monospaced',
    preview: <span className="text-base tracking-tight" style={{ fontFamily: "'iA Writer Mono', 'IBM Plex Mono', Consolas, 'Courier New', monospace" }}>Aa</span>
  },
  {
    value: 'courier-prime' as FontFamily,
    label: 'Courier Prime',
    description: 'Typewriter classic',
    preview: <span className="text-base" style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}>Aa</span>
  },
  {
    value: 'ia-duo' as FontFamily,
    label: 'iA Writer Duo',
    description: 'Variable width typewriter',
    preview: <span className="text-base tracking-tight" style={{ fontFamily: "'iA Writer Duo', 'JetBrains Mono', 'Fira Code', monospace" }}>Aa</span>
  },
];

const lineWidthOptions = [
  {
    value: 'default' as LineWidth,
    label: 'Default',
    description: 'No width limit',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  },
  {
    value: '60' as LineWidth,
    label: 'Narrow',
    description: '60 characters wide',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━</div>
  },
  {
    value: '80' as LineWidth,
    label: 'Compact',
    description: '80 characters wide',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  },
  {
    value: '120' as LineWidth,
    label: 'Comfortable',
    description: '120 characters wide',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  },
  {
    value: '160' as LineWidth,
    label: 'Wide',
    description: '160 characters wide',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  },
  {
    value: 'full' as LineWidth,
    label: 'Full Width',
    description: 'Use all available space',
    preview: <div className="text-xs font-mono text-muted-foreground overflow-hidden">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
  }
];

interface EditorSettingsSheetProps {
  container?: HTMLElement | null;
}

export function EditorSettingsSheet({ container }: EditorSettingsSheetProps = {}) {

  const [typewriterSettings, setTypewriterSettings] = useTypewriter();

  // Get current values directly from DOM/localStorage
  const getCurrentFontSize = (): FontSize => {
    const saved = localStorage.getItem('zeyn-font-size');
    return (saved as FontSize) || 'md';
  };

  const getCurrentFontFamily = (): FontFamily => {
    const saved = localStorage.getItem('zeyn-font-family') as string | null;
    // Migrate old keys to new ones
    const migrationMap: Record<string, FontFamily> = {
      'sans': 'system',
      'serif': 'times',
      'mono': 'ia-mono',
      'ia-mono': 'ia-mono',
      'ia-duo': 'ia-duo',
      'typewriter': 'courier-prime',
      'ibm-plex-mono': 'ia-mono',
      'special-elite': 'courier-prime',
    };
    if (!saved) return 'system';
    return (migrationMap[saved] ?? (saved as FontFamily)) as FontFamily;
  };

  const getCurrentLineWidth = (): LineWidth => {
    const saved = localStorage.getItem('zeyn-line-width');
    return (saved as LineWidth) || 'default';
  };

  const [fontSize, setCurrentFontSize] = React.useState(getCurrentFontSize());
  const [fontFamily, setCurrentFontFamily] = React.useState(getCurrentFontFamily());
  const [lineWidth, setCurrentLineWidth] = React.useState(getCurrentLineWidth());

  const setTypewriterMode = (mode: TypewriterMode) => {
    setTypewriterSettings({ ...typewriterSettings, mode });
    // Trigger the custom event to notify TipTap editor
    triggerTiptapTypewriterUpdate();
  };

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
      // Remove old and new font-family classes
      editor.classList.remove(
        // old
        'font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter',
        // new
        'font-family-system', 'font-family-roboto', 'font-family-times', 'font-family-ia-mono', 'font-family-courier-prime', 'font-family-ia-duo', 'font-family-ibm-plex-mono', 'font-family-special-elite'
      );
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

  // Apply stored settings on mount only
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

        // Apply font family (remove old + new)
        editor.classList.remove(
          'font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter',
          'font-family-system', 'font-family-roboto', 'font-family-times', 'font-family-ia-mono', 'font-family-courier-prime', 'font-family-ia-duo', 'font-family-ibm-plex-mono', 'font-family-special-elite'
        );
        editor.classList.add(`font-family-${storedFamily}`);

        // Apply line width
        editor.classList.remove('line-width-60', 'line-width-80', 'line-width-120', 'line-width-160', 'line-width-full', 'line-width-default');
        editor.classList.add(`line-width-${storedWidth}`);
      });
    };

    // Apply immediately on mount only
    // TiptapSettingsIntegration will handle ongoing updates
    applyStoredSettings();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[400px] sm:w-[540px] overflow-y-auto max-h-screen"
        container={container}
      >
        <SheetHeader>
          <SheetTitle>Editor Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Font Size Section */}
          <SettingsSlider
            title="Font Size"
            options={fontSizeOptions}
            value={fontSize}
            onChange={setFontSize}
          />

          {/* Font Family Section */}
          <div className="pt-4 border-t">
            <SettingsSlider
              title="Font Family"
              options={fontFamilyOptions}
              value={fontFamily}
              onChange={setFontFamily}
            />
          </div>

          {/* Line Width Section */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-4">Line Width</h4>
            <div className="space-y-2">
              {lineWidthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLineWidth(option.value)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    lineWidth === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      lineWidth === option.value && "text-primary"
                    )}>
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                  <div className="relative h-4 bg-muted rounded overflow-hidden">
                    <div
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-foreground/20 transition-all",
                        lineWidth === option.value && "bg-primary"
                      )}
                      style={{
                        width: option.value === 'default' || option.value === 'full'
                          ? '100%'
                          : `${Math.min(100, (parseInt(option.value) / 160) * 100)}%`
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Typewriter Mode Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Typewriter Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Keep the active line centered in the viewport.
                </p>
              </div>
              <Switch
                id="typewriter-mode"
                checked={typewriterSettings.mode === 'center'}
                onCheckedChange={(checked) => {
                  setTypewriterMode(checked ? 'center' : 'off');
                }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
