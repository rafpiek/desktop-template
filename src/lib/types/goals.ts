import { v7 as uuidv7 } from 'uuid';

// Goal Period Types
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Goal Type Enum for consistency with Prisma schema
export enum GoalType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// Writing Goal Interface
export interface WritingGoal {
  id: string;
  userId?: string; // For future multi-user support
  type: GoalPeriod;
  targetWords: number;
  targetChars?: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Goal Progress Interface
export interface GoalProgress {
  id: string;
  goalId: string;
  date: string; // ISO string - The specific date this progress is for
  wordsWritten: number;
  charsWritten: number;
  projectIds: string[]; // Projects that contributed to this progress
  documentIds: string[]; // Documents that contributed to this progress
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Goal Statistics Interface
export interface GoalStats {
  daily: GoalPeriodStats;
  weekly: GoalPeriodStats;
  monthly: GoalPeriodStats;
  yearly: GoalPeriodStats;
}

// Individual Period Statistics
export interface GoalPeriodStats {
  target: number;
  achieved: number;
  percentage: number;
  streak: number;
  bestStreak: number;
  averageWords: number;
  totalDays: number;
  successfulDays: number;
  isActive: boolean;
}

// Goal Achievement Interface
export interface GoalAchievement {
  id: string;
  type: 'milestone' | 'streak' | 'personal_best' | 'consistency';
  title: string;
  description: string;
  unlockedAt: string; // ISO string
  icon: string; // Emoji or icon identifier
  value?: number; // Associated value (e.g., streak count, word count)
}

// Goal Settings Interface
export interface GoalSettings {
  dailyGoal: GoalConfig | null;
  weeklyGoal: GoalConfig | null;
  monthlyGoal: GoalConfig | null;
  yearlyGoal: GoalConfig | null;
  enableNotifications: boolean;
  notificationTime: string; // Time of day for reminders (HH:mm format)
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  includeCharacterCount: boolean;
  autoArchiveOldGoals: boolean;
  archiveAfterDays: number;
}

// Individual Goal Configuration
export interface GoalConfig {
  targetWords: number;
  targetChars?: number;
  isEnabled: boolean;
  createdAt: string; // ISO string
  lastModified: string; // ISO string
}

// Daily Writing Session Interface
export interface WritingSession {
  id: string;
  date: string; // ISO string - Date of the session
  startTime: string; // ISO string
  endTime?: string; // ISO string
  wordsWritten: number;
  charsWritten: number;
  projectId: string;
  documentId: string;
  duration?: number; // Duration in minutes
}

// Calendar Day Data Interface (for heatmap/calendar view)
export interface CalendarDayData {
  date: string; // ISO string
  wordsWritten: number;
  charsWritten: number;
  goalMet: boolean;
  goalPercentage: number;
  projects: string[]; // Project IDs worked on
  sessions: number; // Number of writing sessions
  streak: number; // Current streak on this day
}

// Goal Create/Update Inputs
export interface CreateGoalInput {
  type: GoalPeriod;
  targetWords: number;
  targetChars?: number;
  startDate?: string; // ISO string - defaults to today
  isActive?: boolean; // defaults to true
}

export interface UpdateGoalInput {
  id: string;
  targetWords?: number;
  targetChars?: number;
  isActive?: boolean;
  endDate?: string; // ISO string - for archiving goals
}

// Progress Create/Update Inputs
export interface CreateProgressInput {
  goalId: string;
  date: string; // ISO string
  wordsWritten: number;
  charsWritten?: number;
  projectIds: string[];
  documentIds: string[];
}

export interface UpdateProgressInput {
  id: string;
  wordsWritten?: number;
  charsWritten?: number;
  projectIds?: string[];
  documentIds?: string[];
}

// Utility Functions

export function createEmptyGoal(input: CreateGoalInput): WritingGoal {
  const now = new Date().toISOString();
  const startDate = input.startDate || now;

  // Calculate end date based on goal type
  const endDate = calculateGoalEndDate(startDate, input.type);

  return {
    id: uuidv7(),
    type: input.type,
    targetWords: input.targetWords,
    targetChars: input.targetChars,
    startDate,
    endDate,
    isActive: input.isActive !== undefined ? input.isActive : true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyProgress(input: CreateProgressInput): GoalProgress {
  const now = new Date().toISOString();

  return {
    id: uuidv7(),
    goalId: input.goalId,
    date: input.date,
    wordsWritten: input.wordsWritten,
    charsWritten: input.charsWritten || 0,
    projectIds: input.projectIds,
    documentIds: input.documentIds,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateGoalEndDate(startDate: string, type: GoalPeriod): string {
  const start = new Date(startDate);
  const end = new Date(start);

  switch (type) {
    case 'daily':
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Last day of the month
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      end.setMonth(0, 0); // December 31st
      end.setHours(23, 59, 59, 999);
      break;
  }

  return end.toISOString();
}

export function getDateRangeForPeriod(period: GoalPeriod, date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly': {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek); // Start of week (Sunday)
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Last day of the month
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(end.getFullYear() + 1);
      end.setMonth(0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

export function calculateStreak(progress: GoalProgress[], dailyTarget: number): { currentStreak: number; bestStreak: number } {
  if (!progress || progress.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const successDays = new Set<string>();
  progress.forEach(p => {
    if (p.wordsWritten >= dailyTarget) {
      successDays.add(new Date(p.date).toISOString().split('T')[0]);
    }
  });

  if (successDays.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // --- Best Streak Calculation ---
  let bestStreak = 0;
  if (successDays.size > 0) {
    const uniqueDates = Array.from(successDays).sort();
    let tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }
  }

  // --- Current Streak Calculation ---
  let currentStreak = 0;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (successDays.has(todayStr) || successDays.has(yesterdayStr)) {
    let dateToCheck = new Date();
    if (!successDays.has(todayStr)) {
      dateToCheck.setDate(dateToCheck.getDate() - 1);
    }
    while (successDays.has(dateToCheck.toISOString().split('T')[0])) {
      currentStreak++;
      dateToCheck.setDate(dateToCheck.getDate() - 1);
    }
  }

  return { currentStreak, bestStreak };
}

// Independent streak calculation that works without active goals
export interface WritingStreakData {
  currentStreak: number;
  bestStreak: number;
  streakStatus: 'active' | 'broken' | 'none';
  nextMilestone: number | null;
  daysUntilMilestone: number | null;
  todayWordCount: number;
  isStreakActive: boolean;
}

// Calculate writing streak based on document activity (independent of goals)
export function calculateWritingStreak(
  documents: { id: string; updatedAt: string; wordCount: number }[],
  minimumWordsPerDay: number = 100
): WritingStreakData {
  if (!documents || documents.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      streakStatus: 'none',
      nextMilestone: ACHIEVEMENT_MILESTONES.streak[0], // First milestone (3 days)
      daysUntilMilestone: 3,
      todayWordCount: 0,
      isStreakActive: false,
    };
  }

  // Group documents by their update date to calculate daily word counts
  const dailyWordCounts = new Map<string, number>();
  const today = new Date().toISOString().split('T')[0];
  let todayWordCount = 0;

  documents.forEach(doc => {
    const dateKey = new Date(doc.updatedAt).toISOString().split('T')[0];
    const currentCount = dailyWordCounts.get(dateKey) || 0;
    dailyWordCounts.set(dateKey, currentCount + doc.wordCount);

    if (dateKey === today) {
      todayWordCount += doc.wordCount;
    }
  });

  // Convert to sorted array of [date, wordCount] pairs
  const sortedDays = Array.from(dailyWordCounts.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  // Calculate current streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // First, calculate the best streak by going through all days
  for (const [, wordCount] of sortedDays) {
    if (wordCount >= minimumWordsPerDay) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Now calculate current streak from today backwards
  for (const [dateStr, wordCount] of sortedDays) {
    const dayDate = new Date(dateStr);
    dayDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if this day continues our streak
    if (dayDiff === currentStreak && wordCount >= minimumWordsPerDay) {
      currentStreak++;
      continue;
    }

    // If we've found a gap, stop
    if (dayDiff > currentStreak) {
      break;
    }
  }

  // Determine streak status
  const hasWrittenToday = todayWordCount >= minimumWordsPerDay;
  let streakStatus: 'active' | 'broken' | 'none';

  if (currentStreak === 0) {
    streakStatus = 'none';
  } else if (hasWrittenToday || currentStreak > 0) {
    streakStatus = 'active';
  } else {
    streakStatus = 'broken';
  }

  // Find next milestone
  const currentStreakValue = Math.max(currentStreak, 0);
  const nextMilestone = ACHIEVEMENT_MILESTONES.streak.find(milestone => milestone > currentStreakValue);
  const daysUntilMilestone = nextMilestone ? nextMilestone - currentStreakValue : null;

  return {
    currentStreak,
    bestStreak,
    streakStatus,
    nextMilestone,
    daysUntilMilestone,
    todayWordCount,
    isStreakActive: currentStreak > 0 && hasWrittenToday,
  };
}

/**
 * Calculates the percentage of a goal that has been achieved.
 */
export function calculateGoalPercentage(achieved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((achieved / target) * 100);
}

export function formatGoalPeriod(period: GoalPeriod): string {
  const periodLabels: Record<GoalPeriod, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  return periodLabels[period];
}

export const DEFAULT_GOAL_SETTINGS: GoalSettings = {
  dailyGoal: null,
  weeklyGoal: null,
  monthlyGoal: null,
  yearlyGoal: null,
  enableNotifications: false,
  notificationTime: '09:00',
  weekStartsOn: 1, // Monday
  includeCharacterCount: false,
  autoArchiveOldGoals: true,
  archiveAfterDays: 90,
};

export const ACHIEVEMENT_MILESTONES = {
  words: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000],
  streak: [3, 7, 14, 30, 60, 90, 180, 365],
  projects: [1, 5, 10, 25, 50],
  chapters: [1, 10, 25, 50, 100],
};
