'use client';

// Simple daily progress tracking - just tracks word increments throughout the day

export interface DailyWordProgress {
  date: string; // YYYY-MM-DD format
  wordsAdded: number; // Total words added today across all documents
  lastUpdated: string; // ISO timestamp
}

// Storage key for daily progress
const DAILY_PROGRESS_KEY = 'zeyn-daily-progress';

// Get today's date in YYYY-MM-DD format
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get today's progress
export const getTodayWordProgress = (): DailyWordProgress => {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), wordsAdded: 0, lastUpdated: new Date().toISOString() };
  }

  try {
    const today = getTodayKey();
    const stored = localStorage.getItem(`${DAILY_PROGRESS_KEY}-${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return empty progress for today
    return { date: today, wordsAdded: 0, lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to get today\'s progress:', error);
    return { date: getTodayKey(), wordsAdded: 0, lastUpdated: new Date().toISOString() };
  }
};

// Add words to today's progress
export const addWordsToToday = (wordsToAdd: number): DailyWordProgress => {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), wordsAdded: wordsToAdd, lastUpdated: new Date().toISOString() };
  }

  if (wordsToAdd <= 0) {
    return getTodayWordProgress(); // No change if no words to add
  }

  try {
    const today = getTodayKey();
    const currentProgress = getTodayWordProgress();
    
    const updatedProgress: DailyWordProgress = {
      date: today,
      wordsAdded: currentProgress.wordsAdded + wordsToAdd,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(`${DAILY_PROGRESS_KEY}-${today}`, JSON.stringify(updatedProgress));
    
    console.log(`📝 Added ${wordsToAdd} words to daily progress. Total: ${updatedProgress.wordsAdded}`);
    
    return updatedProgress;
  } catch (error) {
    console.error('Failed to add words to daily progress:', error);
    return getTodayWordProgress();
  }
};

// Reset today's progress (useful for testing)
export const resetTodayProgress = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const today = getTodayKey();
    localStorage.removeItem(`${DAILY_PROGRESS_KEY}-${today}`);
    console.log('🔄 Reset today\'s progress');
  } catch (error) {
    console.error('Failed to reset today\'s progress:', error);
  }
};

// Get progress for a specific date
export const getProgressForDate = (date: string): DailyWordProgress => {
  if (typeof window === 'undefined') {
    return { date, wordsAdded: 0, lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(`${DAILY_PROGRESS_KEY}-${date}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    return { date, wordsAdded: 0, lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to get progress for date:', date, error);
    return { date, wordsAdded: 0, lastUpdated: new Date().toISOString() };
  }
};

// Clean up old progress entries (keep last 30 days)
export const cleanupOldProgress = (): number => {
  if (typeof window === 'undefined') return 0;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    let cleanedCount = 0;
    const prefix = `${DAILY_PROGRESS_KEY}-`;

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const dateFromKey = key.substring(prefix.length);
        if (dateFromKey < cutoffDate) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Failed to cleanup old progress:', error);
    return 0;
  }
};