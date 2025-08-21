import { v7 as uuidv7 } from 'uuid';
import type {
  WritingGoal,
  GoalProgress,
  GoalSettings,
  GoalPeriod
} from '@/lib/types/goals';
import { createEmptyGoal, createEmptyProgress, DEFAULT_GOAL_SETTINGS } from '@/lib/types/goals';
import type { SeededData, SeededGoalsData, SeededWritingActivity, WritingPatternConfig } from './types';

/**
 * Generate realistic historical writing statistics and goals data
 */
export async function seedHistoricalStats(projectData: SeededData): Promise<SeededGoalsData> {
  console.log('📊 Generating historical writing statistics...');
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Create realistic writing goals
  const goals = createWritingGoals();
  
  // Generate historical writing activity with realistic patterns
  const historicalActivity = generateHistoricalActivity(thirtyDaysAgo, now, projectData);
  
  // Create goal progress based on historical activity
  const progress = generateGoalProgress(goals, historicalActivity);
  
  // Create goal settings
  const settings: GoalSettings = {
    ...DEFAULT_GOAL_SETTINGS,
    dailyGoal: {
      targetWords: 500,
      isEnabled: true,
      createdAt: thirtyDaysAgo.toISOString(),
      lastModified: now.toISOString()
    },
    weeklyGoal: {
      targetWords: 3500,
      isEnabled: true,
      createdAt: thirtyDaysAgo.toISOString(),
      lastModified: now.toISOString()
    },
    monthlyGoal: {
      targetWords: 15000,
      isEnabled: true,
      createdAt: thirtyDaysAgo.toISOString(),
      lastModified: now.toISOString()
    },
    enableNotifications: true,
    notificationTime: '09:00',
    weekStartsOn: 1, // Monday
    includeCharacterCount: false,
    autoArchiveOldGoals: true,
    archiveAfterDays: 90
  };
  
  console.log(`   Generated ${historicalActivity.length} days of writing activity`);
  console.log(`   Generated ${goals.length} writing goals`);
  console.log(`   Generated ${progress.length} progress entries`);
  
  return {
    goals,
    progress,
    settings,
    historicalActivity
  };
}

/**
 * Create realistic writing goals
 */
function createWritingGoals(): WritingGoal[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const goals: WritingGoal[] = [];
  
  // Daily goal
  goals.push(createEmptyGoal({
    type: 'daily',
    targetWords: 500,
    startDate: thirtyDaysAgo.toISOString(),
    isActive: true
  }));
  
  // Weekly goal  
  goals.push(createEmptyGoal({
    type: 'weekly',
    targetWords: 3500,
    startDate: getStartOfWeek(thirtyDaysAgo).toISOString(),
    isActive: true
  }));
  
  // Monthly goal
  goals.push(createEmptyGoal({
    type: 'monthly',
    targetWords: 15000,
    startDate: getStartOfMonth(thirtyDaysAgo).toISOString(),
    isActive: true
  }));
  
  return goals;
}

/**
 * Generate realistic historical writing activity over the past month
 */
function generateHistoricalActivity(
  startDate: Date,
  endDate: Date,
  projectData: SeededData
): SeededWritingActivity[] {
  const activities: SeededWritingActivity[] = [];
  const patternConfig: WritingPatternConfig = {
    minDailyWords: 0,
    maxDailyWords: 1200,
    streakLengths: [3, 5, 7, 10, 14], // Possible streak lengths
    breakLengths: [1, 2, 3], // Possible break lengths
    weekendMultiplier: 1.4, // 40% more productive on weekends
    weekdayVariance: 0.3, // 30% variance in weekday productivity
    sprintPeriods: 2, // Two high-productivity periods
    blockPeriods: 1, // One writer's block period
    dailyGoalAchievementRate: 0.65 // 65% of days meet the goal
  };
  
  const currentDate = new Date(startDate);
  const projectIds = projectData.projects.map(p => p.id);
  const documentIds = projectData.documents.map(d => d.id);
  
  // Generate activity patterns
  const activityPattern = generateWritingPattern(
    Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
    patternConfig
  );
  
  let dayIndex = 0;
  while (currentDate <= endDate && dayIndex < activityPattern.length) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const baseWords = activityPattern[dayIndex];
    
    // Apply weekend boost
    const finalWords = isWeekend ? Math.floor(baseWords * patternConfig.weekendMultiplier) : baseWords;
    
    if (finalWords > 0) {
      // Randomly select which projects/documents were worked on
      const workedProjects = getRandomSubset(projectIds, Math.min(2, projectIds.length));
      const workedDocuments = getRandomSubset(documentIds, Math.min(4, documentIds.length));
      const sessionCount = finalWords > 800 ? 2 : 1; // Multiple sessions for high-word days
      
      activities.push({
        date: currentDate.toISOString().split('T')[0],
        wordsWritten: finalWords,
        projects: workedProjects,
        documents: workedDocuments,
        sessionCount
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  return activities;
}

/**
 * Generate realistic writing patterns with streaks and breaks
 */
function generateWritingPattern(days: number, config: WritingPatternConfig): number[] {
  const pattern: number[] = new Array(days).fill(0);
  let currentDay = 0;
  
  while (currentDay < days) {
    // Decide on streak or break
    const isStreak = Math.random() > 0.3; // 70% chance of productive period
    
    if (isStreak) {
      const streakLength = config.streakLengths[Math.floor(Math.random() * config.streakLengths.length)];
      const endDay = Math.min(currentDay + streakLength, days);
      
      // Generate words for streak period
      for (let i = currentDay; i < endDay; i++) {
        const baseWords = config.minDailyWords + 
          Math.random() * (config.maxDailyWords - config.minDailyWords);
        
        // Add some variance - some days higher, some lower
        const variance = 1 + (Math.random() - 0.5) * config.weekdayVariance;
        const finalWords = Math.max(0, Math.floor(baseWords * variance));
        
        // Ensure goal achievement rate is realistic
        if (Math.random() < config.dailyGoalAchievementRate) {
          pattern[i] = Math.max(finalWords, 500); // Meet daily goal
        } else {
          pattern[i] = Math.min(finalWords, 450); // Don't quite meet goal
        }
      }
      
      currentDay = endDay;
    } else {
      // Break period (writer's block or busy days)
      const breakLength = config.breakLengths[Math.floor(Math.random() * config.breakLengths.length)];
      const endDay = Math.min(currentDay + breakLength, days);
      
      // Zero or very low word counts during breaks
      for (let i = currentDay; i < endDay; i++) {
        pattern[i] = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : 0;
      }
      
      currentDay = endDay;
    }
  }
  
  // Add sprint periods (high-productivity days)
  for (let i = 0; i < config.sprintPeriods; i++) {
    const sprintDay = Math.floor(Math.random() * days);
    pattern[sprintDay] = Math.floor(config.maxDailyWords * (1.2 + Math.random() * 0.8)); // 120-200% of max
  }
  
  // Add writer's block periods (consecutive zero days)
  for (let i = 0; i < config.blockPeriods; i++) {
    const blockStart = Math.floor(Math.random() * (days - 3));
    const blockLength = 2 + Math.floor(Math.random() * 3); // 2-4 days
    for (let j = 0; j < blockLength && blockStart + j < days; j++) {
      pattern[blockStart + j] = 0;
    }
  }
  
  return pattern;
}

/**
 * Generate goal progress entries based on historical activity
 */
function generateGoalProgress(goals: WritingGoal[], activities: SeededWritingActivity[]): GoalProgress[] {
  const progress: GoalProgress[] = [];
  
  // Group activities by date for easier processing
  const activitiesByDate = new Map<string, SeededWritingActivity>();
  activities.forEach(activity => {
    activitiesByDate.set(activity.date, activity);
  });
  
  const dailyGoal = goals.find(g => g.type === 'daily');
  const weeklyGoal = goals.find(g => g.type === 'weekly');
  const monthlyGoal = goals.find(g => g.type === 'monthly');
  
  // Generate daily progress entries
  if (dailyGoal) {
    activities.forEach(activity => {
      progress.push(createEmptyProgress({
        goalId: dailyGoal.id,
        date: activity.date,
        wordsWritten: activity.wordsWritten,
        charsWritten: activity.wordsWritten * 5, // Approximate chars from words
        projectIds: activity.projects,
        documentIds: activity.documents
      }));
    });
  }
  
  // Generate weekly progress entries
  if (weeklyGoal) {
    const weeklyActivities = groupActivitiesByWeek(activities);
    weeklyActivities.forEach(week => {
      const totalWords = week.activities.reduce((sum, a) => sum + a.wordsWritten, 0);
      if (totalWords > 0) {
        progress.push(createEmptyProgress({
          goalId: weeklyGoal.id,
          date: week.startDate,
          wordsWritten: totalWords,
          charsWritten: totalWords * 5,
          projectIds: [...new Set(week.activities.flatMap(a => a.projects))],
          documentIds: [...new Set(week.activities.flatMap(a => a.documents))]
        }));
      }
    });
  }
  
  // Generate monthly progress entries
  if (monthlyGoal) {
    const monthlyActivities = groupActivitiesByMonth(activities);
    monthlyActivities.forEach(month => {
      const totalWords = month.activities.reduce((sum, a) => sum + a.wordsWritten, 0);
      if (totalWords > 0) {
        progress.push(createEmptyProgress({
          goalId: monthlyGoal.id,
          date: month.startDate,
          wordsWritten: totalWords,
          charsWritten: totalWords * 5,
          projectIds: [...new Set(month.activities.flatMap(a => a.projects))],
          documentIds: [...new Set(month.activities.flatMap(a => a.documents))]
        }));
      }
    });
  }
  
  return progress;
}

/**
 * Utility functions
 */
function getRandomSubset<T>(array: T[], maxCount: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  const count = Math.max(1, Math.floor(Math.random() * maxCount) + 1);
  return shuffled.slice(0, count);
}

function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getStartOfMonth(date: Date): Date {
  const startOfMonth = new Date(date);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
}

function groupActivitiesByWeek(activities: SeededWritingActivity[]): Array<{
  startDate: string;
  activities: SeededWritingActivity[];
}> {
  const weeks = new Map<string, SeededWritingActivity[]>();
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const startOfWeek = getStartOfWeek(date);
    const weekKey = startOfWeek.toISOString().split('T')[0];
    
    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, []);
    }
    weeks.get(weekKey)!.push(activity);
  });
  
  return Array.from(weeks.entries()).map(([startDate, weekActivities]) => ({
    startDate,
    activities: weekActivities
  }));
}

function groupActivitiesByMonth(activities: SeededWritingActivity[]): Array<{
  startDate: string;
  activities: SeededWritingActivity[];
}> {
  const months = new Map<string, SeededWritingActivity[]>();
  
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const startOfMonth = getStartOfMonth(date);
    const monthKey = startOfMonth.toISOString().split('T')[0];
    
    if (!months.has(monthKey)) {
      months.set(monthKey, []);
    }
    months.get(monthKey)!.push(activity);
  });
  
  return Array.from(months.entries()).map(([startDate, monthActivities]) => ({
    startDate,
    activities: monthActivities
  }));
}