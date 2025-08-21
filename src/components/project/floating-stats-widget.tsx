import React, { useState, useEffect } from 'react';
import { X, BarChart3, Target, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoalsContext } from '@/contexts/goals-context';
import { useGoalProgress } from '@/contexts/goal-progress-context';
import { GoalAchievementCelebration } from '@/components/goals/goal-achievement-celebration';
import { Progress } from '@/components/ui/progress';

interface TextStats {
  wordCount: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
}

interface FloatingStatsWidgetProps {
  textStats: TextStats;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
  documentId?: string;
  projectId?: string;
}

export function FloatingStatsWidget({ textStats, isVisible, onToggle, documentId, projectId }: FloatingStatsWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedGoals, setCelebratedGoals] = useState<Set<string>>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('celebrated-goals-' + today);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
      return new Set();
    } catch {
      return new Set();
    }
  });

  const { stats, getGoalByType, goals } = useGoalsContext();
  const { dailyProgress, resetToday } = useGoalProgress();

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

  // Simple daily goal calculation
  const dailyGoal = getGoalByType('daily');
  const totalDailyWords = dailyProgress.totalWords; // From context - SIMPLE!
  const dailyPercentage = dailyGoal ? (totalDailyWords / dailyGoal.targetWords) * 100 : 0;
  const showGoalProgress = dailyGoal && dailyGoal.isActive && isVisible;

  console.log('🎯 SIMPLE DAILY GOAL:', {
    totalDailyWords,
    target: dailyGoal?.targetWords,
    percentage: dailyPercentage,
    note: 'Using simple context-based tracking'
  });

  // Celebration check
  const shouldCelebrate = dailyGoal &&
    dailyGoal.isActive &&
    totalDailyWords >= dailyGoal.targetWords &&
    !celebratedGoals.has(dailyGoal.id);

  // Trigger celebration when needed
  useEffect(() => {
    if (shouldCelebrate && !showCelebration) {
      console.log('🎉 Goal achieved! Triggering celebration');
      setShowCelebration(true);

      // Mark as celebrated
      if (dailyGoal) {
        setCelebratedGoals(prev => {
          const newSet = new Set([...prev, dailyGoal.id]);
          try {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('celebrated-goals-' + today, JSON.stringify([...newSet]));
          } catch {}
          return newSet;
        });
      }
    }
  }, [shouldCelebrate, showCelebration, dailyGoal]);

  // Debug log to check goal values
  useEffect(() => {
    console.log('📊 All goals:', goals);
    if (dailyGoal) {
      console.log('📊 Current daily goal:', {
        id: dailyGoal.id,
        targetWords: dailyGoal.targetWords,
        isActive: dailyGoal.isActive,
        type: dailyGoal.type
      });
    } else {
      console.log('⚠️ No active daily goal found!');
    }
  }, [dailyGoal, goals]);

    // Create real-time stats object - USING REACTIVE VALUES
  const realtimeStats = {
    daily: {
      achieved: totalDailyWords, // This is textStats.wordCount - REACTIVE!
      target: dailyGoal?.targetWords || 0,
      percentage: dailyPercentage,
      isActive: dailyGoal?.isActive || false,
      streak: stats.daily.streak || 0
    }
  };

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
        <div className="space-y-3">
          {/* Word count - primary metric */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Words</span>
            <span className="text-lg font-semibold text-foreground">
              {textStats.wordCount.toLocaleString()}
            </span>
          </div>

          {/* Goal Progress */}
          {showGoalProgress && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {realtimeStats.daily.percentage >= 100 ? (
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  ) : (
                    <Target className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">Daily Goal</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold transition-colors duration-300",
                  realtimeStats.daily.percentage >= 100 ? "text-green-500" : "text-foreground"
                )}>
                  {realtimeStats.daily.achieved.toLocaleString()} / {realtimeStats.daily.target.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <Progress
                  value={Math.min(realtimeStats.daily.percentage, 100)}
                  className="h-2 transition-all duration-300"
                />
                {realtimeStats.daily.percentage > 100 && (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-bold text-green-500">
                      +{Math.round(realtimeStats.daily.percentage - 100)}% extra!
                    </span>
                  </div>
                )}
              </div>
              {realtimeStats.daily.streak > 0 && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <span>🔥</span>
                  <span>{realtimeStats.daily.streak} day streak</span>
                </div>
              )}
              {/* Debug buttons - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      console.log('🎉 Manual celebration trigger!');
                      setShowCelebration(true);
                    }}
                    className="block text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Test Celebration
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      localStorage.removeItem('celebrated-goals-' + today);
                      setCelebratedGoals(new Set());
                      console.log('🔄 Reset celebration state');
                    }}
                    className="block text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Reset Today's Celebrations
                  </button>
                  <button
                    onClick={() => {
                      resetToday();
                      console.log('🔄 Reset daily progress');
                    }}
                    className="block text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Reset Today's Progress
                  </button>
                  <div className="text-xs text-muted-foreground/60">
                    Daily Progress: {totalDailyWords}/{dailyGoal?.targetWords || '?'} words
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Goal Achievement Celebration */}
      <GoalAchievementCelebration
        show={showCelebration}
        onComplete={() => {
          console.log('🎆 Celebration completed');
          setShowCelebration(false);
        }}
        goalType="daily"
        wordsWritten={realtimeStats.daily.achieved}
        target={realtimeStats.daily.target}
        percentage={realtimeStats.daily.percentage}
      />
      {/* Log celebration props for debugging */}
      {showCelebration && (() => {
        console.log('🎯 Passing to celebration:', {
          show: showCelebration,
          wordsWritten: realtimeStats.daily.achieved,
          target: realtimeStats.daily.target,
          percentage: realtimeStats.daily.percentage
        });
        return null;
      })()}
    </div>
  );
}
