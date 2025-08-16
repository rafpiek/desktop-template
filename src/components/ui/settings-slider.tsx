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
          {/* Slider Segments (Visual) */}
          {options.map((option, index) => (
            <div
              key={`segment-${index}`}
              className={cn(
                'absolute top-0 h-2 transition-colors rounded-full',
                'hover:bg-accent-foreground/20',
                value === option.value && 'bg-primary'
              )}
              style={{
                left: `${(index / (options.length - 1)) * 100}%`,
                width: index === options.length - 1 ? '0%' : `${100 / (options.length - 1)}%`,
                transform: index === options.length - 1 ? 'translateX(-100%)' : 'none'
              }}
            />
          ))}
          
          {/* Slider Dots/Markers */}
          {options.map((option, index) => (
            <div
              key={`dot-${index}`}
              className="absolute top-1/2 w-1.5 h-1.5 bg-muted-foreground/40 rounded-full transform -translate-y-1/2"
              style={{
                left: `${(index / (options.length - 1)) * 100}%`,
                transform: 'translateX(-50%) translateY(-50%)'
              }}
            />
          ))}
          
          {/* Slider Handle */}
          <div
            className="absolute top-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-sm transition-all transform -translate-y-1/2 cursor-pointer hover:scale-110 z-10"
            style={{
              left: `${(currentIndex / (options.length - 1)) * 100}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          />
        </div>
        
        {/* Slider Labels */}
        <div className="flex justify-between mt-3 px-1">
          {options.map((option) => (
            <button
              key={`label-${option.value}`}
              onClick={() => onChange(option.value)}
              className={cn(
                'text-xs transition-colors cursor-pointer hover:text-foreground text-center',
                value === option.value 
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
      <div className="text-center space-y-1">
        <div className="text-sm font-medium">
          {currentOption?.label}
        </div>
        <div className="text-xs text-muted-foreground">
          {currentOption?.description}
        </div>
        {currentOption?.preview && (
          <div className="flex justify-center">
            {currentOption.preview}
          </div>
        )}
      </div>
    </div>
  );
}