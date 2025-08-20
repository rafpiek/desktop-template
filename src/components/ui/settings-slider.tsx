import * as React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSliderOption<T = string> {
  value: T;
  label: string;
  description: string;
  preview?: React.ReactNode;
}

interface SettingsSliderProps<T = string> {
  title: string;
  options: SettingsSliderOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SettingsSlider<T = string>({
  title,
  options,
  value,
  onChange,
  className
}: SettingsSliderProps<T>) {
  const currentIndex = options.findIndex(opt => opt.value === value);
  const currentOption = options[currentIndex];

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.round(percentage * (options.length - 1));
    const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
    onChange(options[clampedIndex].value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium">{title}</h3>

      {/* Slider Container */}
      <div className="relative px-2">
        {/* Slider Track */}
        <div
          className="h-2 bg-muted rounded-full relative cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* Active fill */}
          <div
            className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${(currentIndex / (options.length - 1)) * 100}%`
            }}
          />

          {/* Slider Handle */}
          <div
            className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-sm transition-all transform -translate-y-1/2 cursor-pointer hover:scale-110"
            style={{
              left: `${(currentIndex / (options.length - 1)) * 100}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          />
        </div>

        {/* Slider Labels */}
        <div className="flex justify-between mt-3">
          {options.map((option) => (
            <button
              key={`label-${String(option.value)}`}
              onClick={() => onChange(option.value)}
              className={cn(
                'transition-all cursor-pointer text-center',
                value === option.value
                  ? 'text-foreground font-medium scale-110'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={option.label}
              title={option.label}
            >
              {option.preview ?? option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="text-center space-y-1">
        <div className="text-sm font-medium">
          {currentOption?.label}
        </div>
        <div className="text-xs text-muted-foreground">
          {currentOption?.description}
        </div>
      </div>
    </div>
  );
}
