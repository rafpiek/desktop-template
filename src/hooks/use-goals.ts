import { useCallback, useMemo, useEffect } from 'react';
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
import {
  getTodayProgress as getSessionTodayProgress,
  getDailyProgress,
  getAllActiveSessions,
} from '@/components/editor/v2/storage/document-storage';

const GOALS_STORAGE_KEY = 'zeyn-goals';
const GOAL_PROGRESS_STORAGE_KEY = 'zeyn-goal-progress';
const GOAL_SETTINGS_STORAGE_KEY = 'zeyn-goal-settings';

export function useGoals(documents: any[] = []) {
  const [goals, setGoals] = useLocalStorage<WritingGoal[]>(GOALS_STORAGE_KEY, []);
  const [progress, setProgress] = useLocalStorage<GoalProgress[]>(GOAL_PROGRESS_STORAGE_KEY, []);
  const [settings, setSettings] = useLocalStorage<GoalSettings>(GOAL_SETTINGS_STORAGE_KEY, DEFAULT_GOAL_SETTINGS);

  // Log progress data when it's available
  useEffect(() => {
    console.log('[useGoals] Progress data loaded:', progress);
  }, [progress]);

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

  // Get progress for today - calculate from writing sessions
  const getTodayProgress = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailyProgress = getSessionTodayProgress();

    if (!dailyProgress || dailyProgress.totalWordsAdded <= 0) {
      return [];
    }

    // Return in the expected format for the UI
    return [{
      id: 'today',
      goalId: 'daily',
      date: today,
      wordsWritten: dailyProgress.totalWordsAdded,
      charsWritten: dailyProgress.totalWordsAdded * 5, // Rough estimate
      projectIds: dailyProgress.projectIds,
      documentIds: dailyProgress.documentIds,
      createdAt: today,
      updatedAt: today,
    }];
  }, []);

  // Calculate stats for a specific period using session-based tracking
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
    const relevantProgress = progress.filter(p => {
      const progressDate = new Date(p.date);
      return progressDate >= start && progressDate <= end;
    });

    const achieved = relevantProgress.reduce((sum, p) => sum + p.wordsWritten, 0);

    const dailyGoalTarget = getGoalByType('daily')?.targetWords || 500;
    // BUG FIX: Pass the filtered progress to the streak calculation
    const streakData = calculateStreak(relevantProgress, dailyGoalTarget);

    let successfulDays = 0;
    if (period === 'daily') {
      successfulDays = achieved >= goal.targetWords ? 1 : 0;
    } else {
      // For longer periods, count days where writing happened
      const daysWithWriting = new Set(relevantProgress.map(p => p.date));
      successfulDays = daysWithWriting.size;
    }

    const percentage = calculateGoalPercentage(achieved, goal.targetWords);

    const daysInPeriod = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const averageWords = successfulDays > 0 ? Math.round(achieved / successfulDays) : 0;

    return {
      target: goal.targetWords,
      achieved,
      percentage,
      streak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      averageWords,
      totalDays: daysInPeriod,
      successfulDays,
      isActive: goal.isActive,
    };
  }, [getGoalByType, progress]);

  // Calculate all stats
  const calculateAllStats = useCallback((): GoalStats => {
    // We need to calculate stats based on the entire history, not just one period.
    const dailyGoal = getGoalByType('daily');
    const dailyTarget = dailyGoal?.targetWords || 500;

    // Calculate historical stats from the full progress list
    const streakData = calculateStreak(progress, dailyTarget);
    const successfulDays = progress.filter(p => p.wordsWritten >= dailyTarget).length;
    const totalWords = progress.reduce((sum, p) => sum + p.wordsWritten, 0);
    const daysWithWriting = new Set(progress.map(p => p.date)).size;
    const averageWords = daysWithWriting > 0 ? Math.round(totalWords / daysWithWriting) : 0;

    // The 'daily' stats object now reflects today's session + historical streaks
    const dailyStats = calculatePeriodStats('daily');
    dailyStats.streak = streakData.currentStreak;
    dailyStats.bestStreak = streakData.bestStreak;
    dailyStats.successfulDays = successfulDays; // Overall successful days
    dailyStats.averageWords = averageWords; // Overall average

    return {
      daily: dailyStats,
      weekly: calculatePeriodStats('weekly'),
      monthly: calculatePeriodStats('monthly'),
      yearly: calculatePeriodStats('yearly'),
    };
  }, [calculatePeriodStats, getGoalByType, progress]);

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
          isActive: true, // Start as active so they track progress
        });
      } else if (!existingGoal.isActive) {
        // Activate existing inactive goals
        updateGoal({
          id: existingGoal.id,
          isActive: true,
        });
      }
    });
  }, [getGoalByType, createGoal, updateGoal]);

  // Return all functions and data
  return useMemo(() => ({
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
  }), [
    goals,
    progress,
    settings,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveOldGoals,
    getActiveGoals,
    getGoalByType,
    upsertProgress,
    updateProgress,
    getProgressForGoal,
    getTodayProgress,
    calculatePeriodStats,
    calculateAllStats,
    getCalendarData,
    updateSettings,
    initializeDefaultGoals,
  ]);
}
