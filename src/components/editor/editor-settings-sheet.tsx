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

const fontSizeOptions: { name: string; value: FontSize }[] = [
  { name: 'Extra Small', value: 'xs' },
  { name: 'Small', value: 'sm' },
  { name: 'Medium', value: 'md' },
  { name: 'Large', value: 'lg' },
  { name: 'Zen', value: 'zen' },
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editor Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Font size</h3>
            <div className="flex space-x-2">
              {fontSizeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(fontSize === option.value && 'bg-muted')}
                  onClick={() => setFontSize(option.value)}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
