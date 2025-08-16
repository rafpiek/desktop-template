import { useMemo } from 'react';
import { useGoalsContext } from '@/contexts/goals-context';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WritingCalendarProps {
  year?: number;
  month?: number;
  showLegend?: boolean;
  className?: string;
}

export function WritingCalendar({ 
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  showLegend = true,
  className = ''
}: WritingCalendarProps) {
  const { getCalendarData, getGoalByType } = useGoalsContext();
  const dailyGoal = getGoalByType('daily');
  const targetWords = dailyGoal?.targetWords || 500;

  const calendarData = useMemo(() => {
    return getCalendarData(year, month);
  }, [getCalendarData, year, month]);

  // Get the first day of the month and calculate padding
  const firstDay = new Date(year, month, 1);
  const startPadding = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create array of days with padding
  const days = useMemo(() => {
    const result = [];
    
    // Add empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }
    
    // Add actual days
    for (let i = 0; i < daysInMonth; i++) {
      const dayData = calendarData[i];
      result.push(dayData);
    }
    
    return result;
  }, [calendarData, startPadding, daysInMonth]);

  // Get intensity level for a day based on word count
  const getIntensityLevel = (wordsWritten: number): number => {
    if (wordsWritten === 0) return 0;
    const percentage = (wordsWritten / targetWords) * 100;
    
    if (percentage >= 100) return 4;
    if (percentage >= 75) return 3;
    if (percentage >= 50) return 2;
    if (percentage >= 25) return 1;
    return 1;
  };

  // Get color class for intensity level
  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-muted hover:bg-muted/80';
      case 1: return 'bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800';
      case 2: return 'bg-green-400 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600';
      case 3: return 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400';
      case 4: return 'bg-green-800 hover:bg-green-900 dark:bg-green-400 dark:hover:bg-green-300';
      default: return 'bg-muted hover:bg-muted/80';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {monthNames[month]} {year}
        </h3>
        {showLegend && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    getColorClass(level)
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-xs text-muted-foreground text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayData, index) => {
              if (!dayData) {
                return <div key={`empty-${index}`} className="w-full h-8" />;
              }

              const intensity = getIntensityLevel(dayData.wordsWritten);
              const dayNumber = parseInt(dayData.date.split('-')[2]);
              const isToday = dayData.date === new Date().toISOString().split('T')[0];

              return (
                <Tooltip key={dayData.date}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'relative w-full h-8 rounded-sm transition-colors flex items-center justify-center text-xs',
                        getColorClass(intensity),
                        isToday && 'ring-2 ring-primary ring-offset-1'
                      )}
                    >
                      <span className={cn(
                        'font-medium',
                        intensity > 2 ? 'text-white' : 'text-foreground'
                      )}>
                        {dayNumber}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {new Date(dayData.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs">
                        {dayData.wordsWritten.toLocaleString()} words written
                      </p>
                      {dayData.goalMet && (
                        <p className="text-xs text-green-500">✓ Goal achieved!</p>
                      )}
                      {dayData.projects.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {dayData.projects.length} project{dayData.projects.length > 1 ? 's' : ''} worked on
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold">
            {calendarData.reduce((sum, d) => sum + d.wordsWritten, 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total Words</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            {calendarData.filter(d => d.wordsWritten > 0).length}
          </p>
          <p className="text-xs text-muted-foreground">Active Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            {calendarData.filter(d => d.goalMet).length}
          </p>
          <p className="text-xs text-muted-foreground">Goals Met</p>
        </div>
      </div>
    </div>
  );
}

interface YearlyCalendarProps {
  year?: number;
  className?: string;
}

export function YearlyWritingCalendar({ 
  year = new Date().getFullYear(),
  className = ''
}: YearlyCalendarProps) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {months.map(month => (
        <WritingCalendar
          key={month}
          year={year}
          month={month}
          showLegend={false}
        />
      ))}
    </div>
  );
}