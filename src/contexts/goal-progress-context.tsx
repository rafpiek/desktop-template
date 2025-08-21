'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DailyGoalProgress {
  date: string; // YYYY-MM-DD
  totalWords: number; // Total words written today
}

interface GoalProgressContextType {
  dailyProgress: DailyGoalProgress;
  addWords: (words: number) => void;
  resetToday: () => void;
}

const GoalProgressContext = createContext<GoalProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'zeyn-daily-goal-progress';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function loadDailyProgress(): DailyGoalProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { date: getTodayString(), totalWords: 0 };
    }

    const parsed = JSON.parse(stored) as DailyGoalProgress;
    const today = getTodayString();
    
    // If stored data is from yesterday or older, reset to today
    if (parsed.date !== today) {
      console.log('🔄 New day detected, resetting progress');
      const newProgress = { date: today, totalWords: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    }

    return parsed;
  } catch {
    return { date: getTodayString(), totalWords: 0 };
  }
}

function saveDailyProgress(progress: DailyGoalProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore localStorage errors
  }
}

interface GoalProgressProviderProps {
  children: ReactNode;
}

export function GoalProgressProvider({ children }: GoalProgressProviderProps) {
  const [dailyProgress, setDailyProgress] = useState<DailyGoalProgress>(() => loadDailyProgress());

  // Check if day changed on focus/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentProgress = loadDailyProgress();
        if (currentProgress.date !== dailyProgress.date) {
          setDailyProgress(currentProgress);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dailyProgress.date]);

  const addWords = (words: number) => {
    if (words <= 0) return;

    const today = getTodayString();
    const newProgress = {
      date: today,
      totalWords: dailyProgress.date === today ? dailyProgress.totalWords + words : words
    };

    setDailyProgress(newProgress);
    saveDailyProgress(newProgress);
    
    console.log(`📈 Added ${words} words to daily progress. Total: ${newProgress.totalWords}`);
  };

  const resetToday = () => {
    const newProgress = { date: getTodayString(), totalWords: 0 };
    setDailyProgress(newProgress);
    saveDailyProgress(newProgress);
    console.log('🔄 Reset daily progress to 0');
  };

  return (
    <GoalProgressContext.Provider value={{ dailyProgress, addWords, resetToday }}>
      {children}
    </GoalProgressContext.Provider>
  );
}

export function useGoalProgress(): GoalProgressContextType {
  const context = useContext(GoalProgressContext);
  if (context === undefined) {
    throw new Error('useGoalProgress must be used within a GoalProgressProvider');
  }
  return context;
}