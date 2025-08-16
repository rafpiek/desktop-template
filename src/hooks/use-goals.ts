import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  WritingGoal,
  GoalProgress,
  GoalSettings,
  CreateGoalInput,
  UpdateGoalInput,
  CreateProgressInput,
  UpdateProgressInput,
  GoalPeriod,
  GoalStats,
  GoalPeriodStats,
  CalendarDayData,
} from '@/lib/types/goals';
import {
  createEmptyGoal,
  createEmptyProgress,
  calculateStreak,
  calculateGoalPercentage,
  getDateRangeForPeriod,
  DEFAULT_GOAL_SETTINGS,
} from '@/lib/types/goals';

const GOALS_STORAGE_KEY = 'zeyn-goals';
const GOAL_PROGRESS_STORAGE_KEY = 'zeyn-goal-progress';
const GOAL_SETTINGS_STORAGE_KEY = 'zeyn-goal-settings';

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<WritingGoal[]>(GOALS_STORAGE_KEY, []);
  const [progress, setProgress] = useLocalStorage<GoalProgress[]>(GOAL_PROGRESS_STORAGE_KEY, []);
  const [settings, setSettings] = useLocalStorage<GoalSettings>(GOAL_SETTINGS_STORAGE_KEY, DEFAULT_GOAL_SETTINGS);

  // Create a new goal
  const createGoal = useCallback((input: CreateGoalInput) => {
    const newGoal = createEmptyGoal(input);
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  }, [setGoals]);

  // Update an existing goal
  const updateGoal = useCallback((input: UpdateGoalInput) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== input.id) return goal;

      return {
        ...goal,
        ...input,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [setGoals]);

  // Delete a goal and its progress
  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setProgress(prev => prev.filter(p => p.goalId !== id));
  }, [setGoals, setProgress]);

  // Archive old goals
  const archiveOldGoals = useCallback(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (settings.archiveAfterDays || 90));
    
    setGoals(prev => prev.map(goal => {
      if (new Date(goal.endDate) < cutoffDate) {
        return { ...goal, isActive: false };
      }
      return goal;
    }));
  }, [setGoals, settings.archiveAfterDays]);

  // Get active goals
  const getActiveGoals = useCallback(() => {
    return goals.filter(goal => goal.isActive);
  }, [goals]);

  // Get goal by type
  const getGoalByType = useCallback((type: GoalPeriod): WritingGoal | undefined => {
    return goals.find(goal => goal.type === type && goal.isActive);
  }, [goals]);

  // Create or update progress
  const upsertProgress = useCallback((input: CreateProgressInput) => {
    setProgress(prev => {
      const existingIndex = prev.findIndex(
        p => p.goalId === input.goalId && p.date === input.date
      );

      if (existingIndex >= 0) {
        // Update existing progress
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          wordsWritten: input.wordsWritten,
          charsWritten: input.charsWritten || 0,
          projectIds: input.projectIds,
          documentIds: input.documentIds,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        // Create new progress
        const newProgress = createEmptyProgress(input);
        return [...prev, newProgress];
      }
    });
  }, [setProgress]);

  // Update progress
  const updateProgress = useCallback((input: UpdateProgressInput) => {
    setProgress(prev => prev.map(p => {
      if (p.id !== input.id) return p;

      return {
        ...p,
        ...input,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [setProgress]);

  // Get progress for a specific goal and date range
  const getProgressForGoal = useCallback((goalId: string, startDate?: Date, endDate?: Date) => {
    return progress.filter(p => {
      if (p.goalId !== goalId) return false;
      if (!startDate || !endDate) return true;

      const progressDate = new Date(p.date);
      return progressDate >= startDate && progressDate <= endDate;
    });
  }, [progress]);

  // Get progress for today
  const getTodayProgress = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return progress.filter(p => p.date.startsWith(todayStr));
  }, [progress]);

  // Calculate stats for a specific period
  const calculatePeriodStats = useCallback((period: GoalPeriod): GoalPeriodStats => {
    const goal = getGoalByType(period);
    if (!goal) {
      return {
        target: 0,
        achieved: 0,
        percentage: 0,
        streak: 0,
        bestStreak: 0,
        averageWords: 0,
        totalDays: 0,
        successfulDays: 0,
        isActive: false,
      };
    }

    const { start, end } = getDateRangeForPeriod(period);
    const periodProgress = getProgressForGoal(goal.id, start, end);
    
    const achieved = periodProgress.reduce((sum, p) => sum + p.wordsWritten, 0);
    const percentage = calculateGoalPercentage(achieved, goal.targetWords);
    const streak = calculateStreak(periodProgress, goal.targetWords);
    
    // Calculate best streak (simplified for now)
    const bestStreak = Math.max(streak, 0);
    
    // Calculate average words per day in period
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const averageWords = daysInPeriod > 0 ? Math.round(achieved / daysInPeriod) : 0;
    
    // Count successful days
    const successfulDays = periodProgress.filter(p => p.wordsWritten >= goal.targetWords).length;

    return {
      target: goal.targetWords,
      achieved,
      percentage,
      streak,
      bestStreak,
      averageWords,
      totalDays: daysInPeriod,
      successfulDays,
      isActive: goal.isActive,
    };
  }, [getGoalByType, getProgressForGoal]);

  // Calculate all stats
  const calculateAllStats = useCallback((): GoalStats => {
    return {
      daily: calculatePeriodStats('daily'),
      weekly: calculatePeriodStats('weekly'),
      monthly: calculatePeriodStats('monthly'),
      yearly: calculatePeriodStats('yearly'),
    };
  }, [calculatePeriodStats]);

  // Get calendar data for a month
  const getCalendarData = useCallback((year: number, month: number): CalendarDayData[] => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const dailyGoal = getGoalByType('daily');
    const targetWords = dailyGoal?.targetWords || 0;

    const calendarData: CalendarDayData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayProgress = progress.filter(p => p.date.startsWith(dateStr));
      
      const wordsWritten = dayProgress.reduce((sum, p) => sum + p.wordsWritten, 0);
      const charsWritten = dayProgress.reduce((sum, p) => sum + p.charsWritten, 0);
      const projectIds = [...new Set(dayProgress.flatMap(p => p.projectIds))];
      
      calendarData.push({
        date: dateStr,
        wordsWritten,
        charsWritten,
        goalMet: wordsWritten >= targetWords,
        goalPercentage: calculateGoalPercentage(wordsWritten, targetWords),
        projects: projectIds,
        sessions: dayProgress.length,
        streak: 0, // Will be calculated separately if needed
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendarData;
  }, [progress, getGoalByType]);

  // Update goal settings
  const updateSettings = useCallback((updates: Partial<GoalSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }));
  }, [setSettings]);

  // Initialize default goals if none exist
  const initializeDefaultGoals = useCallback(() => {
    const periods: GoalPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
    const defaultTargets = {
      daily: 500,
      weekly: 3500,
      monthly: 15000,
      yearly: 180000,
    };

    periods.forEach(period => {
      const existingGoal = getGoalByType(period);
      if (!existingGoal) {
        createGoal({
          type: period,
          targetWords: defaultTargets[period],
          isActive: false, // Start as inactive
        });
      }
    });
  }, [getGoalByType, createGoal]);

  // Return all functions and data
  return {
    // Data
    goals,
    progress,
    settings,
    
    // Goal CRUD
    createGoal,
    updateGoal,
    deleteGoal,
    archiveOldGoals,
    getActiveGoals,
    getGoalByType,
    
    // Progress CRUD
    upsertProgress,
    updateProgress,
    getProgressForGoal,
    getTodayProgress,
    
    // Statistics
    calculatePeriodStats,
    calculateAllStats,
    getCalendarData,
    
    // Settings
    updateSettings,
    
    // Utilities
    initializeDefaultGoals,
  };
}