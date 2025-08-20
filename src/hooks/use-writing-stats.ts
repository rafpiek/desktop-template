import { useMemo } from 'react';
import { useProject } from '@/contexts/project-context';
import { calculateWritingStreak, type WritingStreakData } from '@/lib/types/goals';

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
    
    // Group documents by date
    const documentsByDate = new Map<string, { docs: any[], wordCount: number }>();
    
    documents.forEach(doc => {
      const docDate = new Date(doc.updatedAt);
      const dateKey = docDate.toISOString().split('T')[0];
      
      if (!documentsByDate.has(dateKey)) {
        documentsByDate.set(dateKey, { docs: [], wordCount: 0 });
      }
      
      const dateData = documentsByDate.get(dateKey)!;
      dateData.docs.push(doc);
      dateData.wordCount += doc.wordCount;
    });
    
    // Calculate time-based stats
    let todayWords = 0;
    let weekWords = 0;
    let monthWords = 0;
    let writingDaysThisWeek = 0;
    let writingDaysThisMonth = 0;
    
    let bestDay: { date: string; wordCount: number } | null = null;
    
    documentsByDate.forEach((dateData, dateKey) => {
      const docDate = new Date(dateKey);
      docDate.setHours(0, 0, 0, 0);
      
      // Today's words
      if (docDate.getTime() === today.getTime()) {
        todayWords = dateData.wordCount;
      }
      
      // This week's words
      if (docDate >= weekStart) {
        weekWords += dateData.wordCount;
        if (dateData.wordCount > 0) {
          writingDaysThisWeek++;
        }
      }
      
      // This month's words
      if (docDate >= monthStart) {
        monthWords += dateData.wordCount;
        if (dateData.wordCount > 0) {
          writingDaysThisMonth++;
        }
      }
      
      // Track best day
      if (!bestDay || dateData.wordCount > bestDay.wordCount) {
        bestDay = {
          date: dateKey,
          wordCount: dateData.wordCount,
        };
      }
    });
    
    // Calculate averages
    const daysWithData = documentsByDate.size;
    const averageWordsPerDay = daysWithData > 0 ? Math.round(totalWords / daysWithData) : 0;
    const averageWordsPerDocument = totalDocuments > 0 ? Math.round(totalWords / totalDocuments) : 0;
    
    // Calculate consistency score (0-100)
    // Based on how many days in the last 30 days the user wrote something
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    let writingDaysInLast30 = 0;
    documentsByDate.forEach((dateData, dateKey) => {
      const docDate = new Date(dateKey);
      if (docDate >= thirtyDaysAgo && dateData.wordCount > 0) {
        writingDaysInLast30++;
      }
    });
    
    const consistencyScore = Math.min(Math.round((writingDaysInLast30 / 30) * 100), 100);
    
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