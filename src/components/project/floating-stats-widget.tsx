import React, { useState, useEffect, useRef } from 'react';
import { X, BarChart3, Target, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoalsContext } from '@/contexts/goals-context';
import { GoalAchievementCelebration } from '@/components/goals/goal-achievement-celebration';
import { Progress } from '@/components/ui/progress';
import { 
  getTodayProgress,
  getCurrentSession,
  type WritingSession 
} from '@/components/editor/v2/storage/document-storage';

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
    // Check if we've already celebrated today
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('celebrated-goals-' + today);
      // Clear any stale celebration data on mount to ensure celebrations work
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only keep celebrations from the last hour to avoid blocking legitimate celebrations
          const lastCelebrationTime = localStorage.getItem('last-celebration-time');
          if (lastCelebrationTime) {
            const timeDiff = Date.now() - parseInt(lastCelebrationTime);
            if (timeDiff > 3600000) { // More than 1 hour
              console.log('🔄 Clearing stale celebration data');
              localStorage.removeItem('celebrated-goals-' + today);
              return new Set();
            }
          }
          return new Set(parsed);
        } catch {
          return new Set();
        }
      }
      return new Set();
    } catch {
      return new Set();
    }
  });
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  const [dailyProgressWords, setDailyProgressWords] = useState(0);
  const hasInitializedRef = useRef(false);

  const { stats, getGoalByType, trackDocumentChange, getTodayProgress: getGoalTodayProgress, goals } = useGoalsContext();

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

  // Initialize session tracking with our new system
  useEffect(() => {
    if (!hasInitializedRef.current && documentId) {
      console.log('📝 Initializing session tracking');
      
      // Get current session for this document
      const session = getCurrentSession(documentId);
      setCurrentSession(session);
      
      // Get today's total progress
      const todayProgress = getTodayProgress();
      setDailyProgressWords(todayProgress?.totalWordsAdded || 0);
      
      hasInitializedRef.current = true;
      
      // Check if we should immediately celebrate (goal already achieved but not celebrated)
      const dailyGoal = getGoalByType('daily');
      const totalDailyWords = todayProgress?.totalWordsAdded || 0;
      
      if (dailyGoal && dailyGoal.isActive && totalDailyWords >= dailyGoal.targetWords) {
        // Clear stale celebration to allow immediate celebration
        const today = new Date().toISOString().split('T')[0];
        const lastCelebrationTime = localStorage.getItem('last-celebration-time');
        const timeSinceLastCelebration = lastCelebrationTime ? Date.now() - parseInt(lastCelebrationTime) : Infinity;
        
        // If it's been more than 5 minutes since last celebration, allow it again
        if (timeSinceLastCelebration > 300000) { // 5 minutes
          console.log('🎉 Goal already achieved, clearing stale celebration to trigger new one!');
          localStorage.removeItem('celebrated-goals-' + today);
          localStorage.removeItem('last-celebration-time');
          setCelebratedGoals(new Set());
        }
      }
    }
  }, [documentId, getGoalByType]);

    // Track session updates and check for celebrations
  useEffect(() => {
    if (!documentId || !projectId) return;

    // Update session data and daily progress
    const session = getCurrentSession(documentId);
    setCurrentSession(session);
    
    const todayProgress = getTodayProgress();
    const totalDailyWords = todayProgress?.totalWordsAdded || 0;
    setDailyProgressWords(totalDailyWords);

    // Check if daily goal is achieved and not yet celebrated
    const dailyGoal = getGoalByType('daily');

    console.log('🔍 Checking goal achievement:', {
      dailyGoal: dailyGoal?.targetWords,
      isActive: dailyGoal?.isActive,
      sessionWords: session?.wordsAdded || 0,
      totalDailyWords,
      alreadyCelebrated: dailyGoal ? celebratedGoals.has(dailyGoal.id) : false,
      celebratedGoalsSet: [...celebratedGoals],
      showCelebration,
      wouldTrigger: dailyGoal && dailyGoal.isActive && totalDailyWords >= dailyGoal.targetWords && !celebratedGoals.has(dailyGoal.id)
    });

    if (dailyGoal && dailyGoal.isActive) {
      if (totalDailyWords >= dailyGoal.targetWords && !celebratedGoals.has(dailyGoal.id)) {
        // Trigger celebration!
        console.log('🎯 GOAL ACHIEVED! Triggering celebration...', {
          totalDailyWords,
          target: dailyGoal.targetWords,
          celebrated: celebratedGoals.has(dailyGoal.id),
          goalId: dailyGoal.id
        });
        console.log('🚀 SETTING showCelebration to TRUE!');
        setShowCelebration(true);
        setCelebratedGoals(prev => {
          const newSet = new Set([...prev, dailyGoal.id]);
          // Persist to localStorage for today
          try {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('celebrated-goals-' + today, JSON.stringify([...newSet]));
            localStorage.setItem('last-celebration-time', Date.now().toString());
          } catch {}
          return newSet;
        });

        // Reset celebration tracking at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
          setCelebratedGoals(prev => {
            const newSet = new Set(prev);
            newSet.delete(dailyGoal.id);
            return newSet;
          });
          hasInitializedRef.current = false; // Reset for next day
        }, msUntilMidnight);
      }
    }
  }, [textStats.wordCount, documentId, projectId, getGoalByType, celebratedGoals]);

        // Calculate real-time progress using session-based data
  const dailyGoal = getGoalByType('daily');

  // Use session-based daily progress, not document word count
  const totalDailyWords = dailyProgressWords; // Session-based daily progress
  const dailyPercentage = dailyGoal ? (totalDailyWords / dailyGoal.targetWords) * 100 : 0;
  const showGoalProgress = dailyGoal && dailyGoal.isActive && isVisible;

  // Celebration check - using reactive word count
  const shouldCelebrate = dailyGoal &&
    dailyGoal.isActive &&
    totalDailyWords >= dailyGoal.targetWords &&
    !celebratedGoals.has(dailyGoal.id);

  console.log('🎯 REACTIVE:', {
    wordCount: textStats.wordCount,
    target: dailyGoal?.targetWords,
    percentage: dailyPercentage,
    shouldCelebrate,
    alreadyCelebrated: dailyGoal ? celebratedGoals.has(dailyGoal.id) : false
  });

  // Trigger celebration when needed
  useEffect(() => {
    if (shouldCelebrate && !showCelebration) {
      console.log('💥 SIMPLE TRIGGER: Setting celebration to TRUE!', {
        totalDailyWords,
        target: dailyGoal?.targetWords,
        shouldCelebrate
      });
      setShowCelebration(true);

      // Mark as celebrated
      if (dailyGoal) {
        setCelebratedGoals(prev => {
          const newSet = new Set([...prev, dailyGoal.id]);
          try {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('celebrated-goals-' + today, JSON.stringify([...newSet]));
            localStorage.setItem('last-celebration-time', Date.now().toString());
          } catch {}
          return newSet;
        });
      }
    }
  }, [shouldCelebrate, showCelebration, dailyGoal, totalDailyWords]);

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
              <div className="relative">
                <Progress
                  value={Math.min(realtimeStats.daily.percentage, 100)}
                  className="h-2 transition-all duration-300"
                />
                {realtimeStats.daily.percentage > 100 && (
                  <div className="absolute -top-6 right-0 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-bold text-green-500">
                      {Math.round(realtimeStats.daily.percentage)}%
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
                  <div className="text-xs text-muted-foreground/60">
                    Session: {currentSession?.wordsAdded || 0} words | Daily: {totalDailyWords}/{dailyGoal?.targetWords || '?'} words
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
