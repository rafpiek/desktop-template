import { useMemo } from 'react';
import { useProject } from '@/contexts/project-context';
import { calculateWritingStreak, type WritingStreakData } from '@/lib/types/goals';
import {
  getTodayProgress,
  getDailyProgress,
} from '@/components/editor/v2/storage/document-storage';

export interface WritingStats {
  // Streak data
  streak: WritingStreakData;
  
  // Basic stats
  totalWords: number;
  totalDocuments: number;
  
  // Time-based stats
  todayWords: number;
  weekWords: number;
  monthWords: number;
  
  // Averages and trends
  averageWordsPerDay: number;
  averageWordsPerDocument: number;
  
  // Recent activity
  writingDaysThisWeek: number;
  writingDaysThisMonth: number;
  
  // Performance
  bestDay: {
    date: string;
    wordCount: number;
  } | null;
  
  // Consistency
  consistencyScore: number; // 0-100 based on how regularly user writes
}

export function useWritingStats(): WritingStats {
  const { documents } = useProject();
  
  return useMemo(() => {
    if (!documents || documents.length === 0) {
      return {
        streak: calculateWritingStreak([]),
        totalWords: 0,
        totalDocuments: 0,
        todayWords: 0,
        weekWords: 0,
        monthWords: 0,
        averageWordsPerDay: 0,
        averageWordsPerDocument: 0,
        writingDaysThisWeek: 0,
        writingDaysThisMonth: 0,
        bestDay: null,
        consistencyScore: 0,
      };
    }

    // Calculate streak data
    const streak = calculateWritingStreak(documents);
    
    // Basic totals
    const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
    const totalDocuments = documents.length;
    
    // Date helpers
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of current week
    
    const monthStart = new Date(today);
    monthStart.setDate(1); // Start of current month
    
    // Calculate time-based stats using session data
    let todayWords = 0;
    let weekWords = 0;
    let monthWords = 0;
    let writingDaysThisWeek = 0;
    let writingDaysThisMonth = 0;
    
    let bestDay: { date: string; wordCount: number } | null = null;
    
    // Get today's progress from sessions
    const todayProgress = getTodayProgress();
    todayWords = todayProgress?.totalWordsAdded || 0;
    
    // Calculate week and month stats from daily progress entries
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      const dayProgress = getDailyProgress(dateKey);
      const dayWords = dayProgress?.totalWordsAdded || 0;
      
      // This week's words
      if (checkDate >= weekStart) {
        weekWords += dayWords;
        if (dayWords > 0) {
          writingDaysThisWeek++;
        }
      }
      
      // This month's words
      if (checkDate >= monthStart) {
        monthWords += dayWords;
        if (dayWords > 0) {
          writingDaysThisMonth++;
        }
      }
      
      // Track best day
      if (dayWords > 0 && (!bestDay || dayWords > bestDay.wordCount)) {
        bestDay = {
          date: dateKey,
          wordCount: dayWords,
        };
      }
    }
    
    // Calculate averages based on session data
    let daysWithWriting = 0;
    let totalSessionWords = 0;
    
    // Count days with actual writing sessions in the last 30 days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      const dayProgress = getDailyProgress(dateKey);
      if (dayProgress && dayProgress.totalWordsAdded > 0) {
        daysWithWriting++;
        totalSessionWords += dayProgress.totalWordsAdded;
      }
    }
    
    const averageWordsPerDay = daysWithWriting > 0 ? Math.round(totalSessionWords / daysWithWriting) : 0;
    const averageWordsPerDocument = totalDocuments > 0 ? Math.round(totalWords / totalDocuments) : 0;
    
    // Calculate consistency score (0-100)
    // Based on how many days in the last 30 days the user actually wrote (session-based)
    const consistencyScore = Math.min(Math.round((daysWithWriting / 30) * 100), 100);
    
    return {
      streak,
      totalWords,
      totalDocuments,
      todayWords,
      weekWords,
      monthWords,
      averageWordsPerDay,
      averageWordsPerDocument,
      writingDaysThisWeek,
      writingDaysThisMonth,
      bestDay,
      consistencyScore,
    };
  }, [documents]);
}