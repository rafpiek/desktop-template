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
    value: 'sans' as FontFamily,
    label: 'Sans',
    description: 'Clean and modern',
    preview: <span className="font-sans text-sm">Aa Bb</span>
  },
  {
    value: 'serif' as FontFamily,
    label: 'Serif',
    description: 'Classic and elegant',
    preview: <span className="font-serif text-sm">Aa Bb</span>
  },
  {
    value: 'mono' as FontFamily,
    label: 'Mono',
    description: 'Code-like appearance',
    preview: <span className="font-mono text-sm">Aa Bb</span>
  },
  {
    value: 'ia-mono' as FontFamily,
    label: 'iA Mono',
    description: 'Typewriter style',
    preview: <span className="font-mono text-sm">Aa Bb</span>
  },
  {
    value: 'ia-duo' as FontFamily,
    label: 'iA Duo',
    description: 'Variable width typewriter',
    preview: <span className="font-mono text-sm">Aa Bb</span>
  },
  {
    value: 'typewriter' as FontFamily,
    label: 'Writer',
    description: 'Classic typewriter font',
    preview: <span className="font-mono text-sm">Aa Bb</span>
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

        // Apply font family
        editor.classList.remove('font-family-sans', 'font-family-serif', 'font-family-mono', 'font-family-ia-mono', 'font-family-ia-duo', 'font-family-typewriter');
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
            <SettingsSlider
              title="Line Width"
              options={lineWidthOptions}
              value={lineWidth}
              onChange={setLineWidth}
            />
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
