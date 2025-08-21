import { v7 as uuidv7 } from 'uuid';
import type {
  WritingGoal,
  GoalProgress,
  GoalSettings,
} from '@/lib/types/goals';
import { createEmptyGoal, createEmptyProgress, DEFAULT_GOAL_SETTINGS } from '@/lib/types/goals';
import type { SeededData, SeededGoalsData, SeededWritingActivity } from './types';

/**
 * Generate realistic historical writing statistics and goals data for the past 6 months
 */
export async function seedHistoricalStats(projectData: SeededData): Promise<SeededGoalsData> {
  console.log('📊 Generating realistic 6-month historical writing statistics...');

  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const goals = createWritingGoals(sixMonthsAgo);
  const historicalActivity = generateHistoricalActivity(sixMonthsAgo, now, projectData);
  const progress = generateGoalProgress(goals, historicalActivity);

  const settings: GoalSettings = {
    ...DEFAULT_GOAL_SETTINGS,
    dailyGoal: { targetWords: 750, isEnabled: true, createdAt: sixMonthsAgo.toISOString(), lastModified: now.toISOString() },
    weeklyGoal: { targetWords: 4000, isEnabled: true, createdAt: sixMonthsAgo.toISOString(), lastModified: now.toISOString() },
    monthlyGoal: { targetWords: 15000, isEnabled: true, createdAt: sixMonthsAgo.toISOString(), lastModified: now.toISOString() },
  };

  console.log(`   Generated ${historicalActivity.length} days of writing activity over 6 months.`);

  return { goals, progress, settings, historicalActivity };
}

function createWritingGoals(startDate: Date): WritingGoal[] {
  return [
    createEmptyGoal({ type: 'daily', targetWords: 750, startDate: startDate.toISOString(), isActive: true }),
    createEmptyGoal({ type: 'weekly', targetWords: 4000, startDate: getStartOfWeek(startDate).toISOString(), isActive: true }),
    createEmptyGoal({ type: 'monthly', targetWords: 15000, startDate: getStartOfMonth(startDate).toISOString(), isActive: true }),
  ];
}

/**
 * Generates a realistic 6-month writing history.
 */
function generateHistoricalActivity(startDate: Date, endDate: Date, projectData: SeededData): SeededWritingActivity[] {
  const activities: SeededWritingActivity[] = [];
  const currentDate = new Date(startDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const writingPattern = generatePhasedWritingPattern(totalDays);

  const projectIds = projectData.projects.map(p => p.id);
  const documentIds = projectData.documents.map(d => d.id);

  for (let i = 0; i < totalDays; i++) {
    const wordsWritten = writingPattern[i];

    if (wordsWritten > 0) {
      activities.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        wordsWritten,
        projects: getRandomSubset(projectIds, 2),
        documents: getRandomSubset(documentIds, 4),
        sessionCount: wordsWritten > 1200 ? 2 : 1,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return activities;
}

/**
 * Generates a more realistic, phased writing pattern over a number of days.
 */
function generatePhasedWritingPattern(days: number): number[] {
  const pattern = new Array(days).fill(0);
  const dailyGoalTarget = 750;

  const phases = [
    { duration: 0.25, base: 250, chance: 0.5, weekend: 1.8 },
    { duration: 0.35, base: 600, chance: 0.75, weekend: 1.5 },
    { duration: 0.25, base: 1200, chance: 0.9, weekend: 2.0 },
    { duration: 0.15, base: 400, chance: 0.6, weekend: 1.2 },
  ];

  let dayCursor = 0;
  for (const phase of phases) {
    const phaseDays = Math.floor(days * phase.duration);
    for (let i = 0; i < phaseDays && dayCursor < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - dayCursor - 1));
      const dayOfWeek = date.getDay();

      if (Math.random() < phase.chance) {
        let dailyWords = phase.base * (0.75 + Math.random() * 0.5);
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dailyWords *= phase.weekend * (0.9 + Math.random() * 0.2);
        }
        pattern[dayCursor] = Math.floor(dailyWords);
      }
      dayCursor++;
    }
  }

  // Explicitly engineer streaks for a convincing demo
  const createStreak = (startDay: number, length: number) => {
    for (let i = 0; i < length; i++) {
      const dayIndex = startDay + i;
      if (dayIndex < days) {
        pattern[dayIndex] = dailyGoalTarget + Math.floor(Math.random() * 800);
      }
    }
  };

  // A long streak in the middle to serve as the "best streak"
  createStreak(Math.floor(days * 0.5), 12);

  // A current streak that ends on the last day of seeded data (yesterday)
  const currentStreakLength = 7;
  createStreak(days - currentStreakLength, currentStreakLength);

  // Final pass to cap outliers
  const absoluteMax = 8000;
  return pattern.map(w => Math.min(Math.floor(w), absoluteMax));
}


/**
 * Generate goal progress entries based on historical activity
 */
function generateGoalProgress(goals: WritingGoal[], activities: SeededWritingActivity[]): GoalProgress[] {
  const progress: GoalProgress[] = [];
  const dailyGoal = goals.find(g => g.type === 'daily');
  const weeklyGoal = goals.find(g => g.type === 'weekly');
  const monthlyGoal = goals.find(g => g.type === 'monthly');

  if (dailyGoal) {
    activities.forEach(activity => {
      progress.push(createEmptyProgress({
        goalId: dailyGoal.id,
        date: activity.date,
        wordsWritten: activity.wordsWritten,
        charsWritten: activity.wordsWritten * 5,
        projectIds: activity.projects,
        documentIds: activity.documents
      }));
    });
  }

  if (weeklyGoal) {
    groupActivitiesByPeriod(activities, 'week').forEach(group => {
      progress.push(createEmptyProgress({
        goalId: weeklyGoal.id,
        date: group.startDate,
        wordsWritten: group.totalWords,
        charsWritten: group.totalWords * 5,
        projectIds: group.projectIds,
        documentIds: group.documentIds
      }));
    });
  }

  if (monthlyGoal) {
    groupActivitiesByPeriod(activities, 'month').forEach(group => {
      progress.push(createEmptyProgress({
        goalId: monthlyGoal.id,
        date: group.startDate,
        wordsWritten: group.totalWords,
        charsWritten: group.totalWords * 5,
        projectIds: group.projectIds,
        documentIds: group.documentIds
      }));
    });
  }

  return progress;
}

/**
 * Utility functions
 */
function getRandomSubset<T>(array: T[], maxCount: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const count = Math.max(1, Math.floor(Math.random() * maxCount));
  return shuffled.slice(0, count);
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0, 0));
}

function getStartOfMonth(date: Date): Date {
  return new Date(new Date(date.getFullYear(), date.getMonth(), 1).setHours(0, 0, 0, 0));
}

function groupActivitiesByPeriod(activities: SeededWritingActivity[], period: 'week' | 'month') {
  const groups = new Map<string, SeededWritingActivity[]>();

  activities.forEach(activity => {
    const date = new Date(activity.date);
    const startOfPeriod = period === 'week' ? getStartOfWeek(date) : getStartOfMonth(date);
    const key = startOfPeriod.toISOString().split('T')[0];

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(activity);
  });

  return Array.from(groups.entries()).map(([startDate, periodActivities]) => {
    const totalWords = periodActivities.reduce((sum, a) => sum + a.wordsWritten, 0);
    const projectIds = [...new Set(periodActivities.flatMap(a => a.projects))];
    const documentIds = [...new Set(periodActivities.flatMap(a => a.documents))];
    return { startDate, totalWords, projectIds, documentIds };
  });
}
