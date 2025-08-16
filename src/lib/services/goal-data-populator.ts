import type { Document } from '@/lib/types/project';
import type { WritingGoal, GoalProgress, GoalPeriod } from '@/lib/types/goals';
import { getDateRangeForPeriod } from '@/lib/types/goals';

export interface WritingActivity {
  date: string; // ISO date string (YYYY-MM-DD)
  projectId: string;
  documentId: string;
  wordsWritten: number;
  charsWritten: number;
}

export class GoalDataPopulator {
  /**
   * Analyzes documents to extract writing activity by date
   * Groups document changes by their update date
   */
  static extractWritingActivityFromDocuments(
    documents: Document[]
  ): Map<string, WritingActivity[]> {
    const activityByDate = new Map<string, WritingActivity[]>();

    documents.forEach(doc => {
      // Get the date when this document was last updated
      const updateDate = new Date(doc.updatedAt);
      const dateKey = updateDate.toISOString().split('T')[0];

      // Skip documents with no content
      if (doc.wordCount === 0) return;

      const activity: WritingActivity = {
        date: dateKey,
        projectId: doc.projectId,
        documentId: doc.id,
        wordsWritten: doc.wordCount,
        charsWritten: doc.wordCount * 5, // Rough estimate: 5 chars per word
      };

      if (!activityByDate.has(dateKey)) {
        activityByDate.set(dateKey, []);
      }
      
      activityByDate.get(dateKey)!.push(activity);
    });

    return activityByDate;
  }

  /**
   * Populates historical progress data for all active goals
   * This should be run when the app starts or when goals are created
   */
  static populateHistoricalProgress(
    goals: WritingGoal[],
    documents: Document[],
    existingProgress: GoalProgress[]
  ): GoalProgress[] {
    const activityByDate = this.extractWritingActivityFromDocuments(documents);
    const newProgress: GoalProgress[] = [];
    const progressMap = new Map<string, GoalProgress>();

    // Index existing progress for quick lookup
    existingProgress.forEach(p => {
      const key = `${p.goalId}-${p.date}`;
      progressMap.set(key, p);
    });

    // Process each active goal
    goals.filter(g => g.isActive).forEach(goal => {
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      const today = new Date();
      
      // Determine the actual end date (can't be in the future)
      const actualEndDate = endDate > today ? today : endDate;

      // Process each day in the goal period
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);

      while (currentDate <= actualEndDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const progressKey = `${goal.id}-${dateKey}`;

        // Skip if we already have progress for this date
        if (progressMap.has(progressKey)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Get activity for this date
        const dayActivity = activityByDate.get(dateKey) || [];

        if (dayActivity.length > 0) {
          // Aggregate activity for the day
          const totalWords = dayActivity.reduce((sum, a) => sum + a.wordsWritten, 0);
          const totalChars = dayActivity.reduce((sum, a) => sum + a.charsWritten, 0);
          const projectIds = [...new Set(dayActivity.map(a => a.projectId))];
          const documentIds = [...new Set(dayActivity.map(a => a.documentId))];

          const progress: GoalProgress = {
            id: crypto.randomUUID(),
            goalId: goal.id,
            date: dateKey,
            wordsWritten: totalWords,
            charsWritten: totalChars,
            projectIds,
            documentIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newProgress.push(progress);
          progressMap.set(progressKey, progress);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return newProgress;
  }

  /**
   * Calculates progress for a specific date from document changes
   * Used for real-time tracking when documents are updated
   */
  static calculateDailyProgress(
    date: Date,
    documents: Document[],
    previousDocumentStates?: Map<string, Document>
  ): WritingActivity {
    const dateKey = date.toISOString().split('T')[0];
    let totalWords = 0;
    let totalChars = 0;
    const projectIds = new Set<string>();
    const documentIds = new Set<string>();

    documents.forEach(doc => {
      const docUpdateDate = new Date(doc.updatedAt).toISOString().split('T')[0];
      
      // Only count documents updated on the specified date
      if (docUpdateDate === dateKey) {
        // If we have previous state, calculate the delta
        if (previousDocumentStates?.has(doc.id)) {
          const prevDoc = previousDocumentStates.get(doc.id)!;
          const wordDelta = doc.wordCount - prevDoc.wordCount;
          
          // Only count positive changes (words added, not deleted)
          if (wordDelta > 0) {
            totalWords += wordDelta;
            totalChars += wordDelta * 5;
            projectIds.add(doc.projectId);
            documentIds.add(doc.id);
          }
        } else {
          // No previous state, count all words
          totalWords += doc.wordCount;
          totalChars += doc.wordCount * 5;
          projectIds.add(doc.projectId);
          documentIds.add(doc.id);
        }
      }
    });

    return {
      date: dateKey,
      projectId: Array.from(projectIds).join(','),
      documentId: Array.from(documentIds).join(','),
      wordsWritten: totalWords,
      charsWritten: totalChars,
    };
  }

  /**
   * Determines which goals should track progress for a given date
   */
  static getGoalsForDate(date: Date, goals: WritingGoal[]): WritingGoal[] {
    return goals.filter(goal => {
      if (!goal.isActive) return false;
      
      const goalStart = new Date(goal.startDate);
      const goalEnd = new Date(goal.endDate);
      
      return date >= goalStart && date <= goalEnd;
    });
  }

  /**
   * Calculates aggregate progress for different goal periods
   */
  static aggregateProgressForPeriod(
    period: GoalPeriod,
    progress: GoalProgress[],
    referenceDate: Date = new Date()
  ): { wordsWritten: number; charsWritten: number; dayCount: number } {
    const { start, end } = getDateRangeForPeriod(period, referenceDate);
    
    let totalWords = 0;
    let totalChars = 0;
    const uniqueDays = new Set<string>();

    progress.forEach(p => {
      const progressDate = new Date(p.date);
      if (progressDate >= start && progressDate <= end) {
        totalWords += p.wordsWritten;
        totalChars += p.charsWritten;
        uniqueDays.add(p.date);
      }
    });

    return {
      wordsWritten: totalWords,
      charsWritten: totalChars,
      dayCount: uniqueDays.size,
    };
  }

  /**
   * Cleans up old progress data that is no longer needed
   */
  static cleanupOldProgress(
    progress: GoalProgress[],
    retentionDays: number = 365
  ): GoalProgress[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    return progress.filter(p => {
      const progressDate = new Date(p.date);
      return progressDate >= cutoffDate;
    });
  }

  /**
   * Validates and fixes inconsistent progress data
   */
  static validateAndFixProgress(
    progress: GoalProgress[],
    goals: WritingGoal[]
  ): GoalProgress[] {
    const validGoalIds = new Set(goals.map(g => g.id));
    
    // Remove progress for non-existent goals
    const validProgress = progress.filter(p => validGoalIds.has(p.goalId));
    
    // Remove duplicate entries (keep the most recent)
    const uniqueProgress = new Map<string, GoalProgress>();
    
    validProgress.forEach(p => {
      const key = `${p.goalId}-${p.date}`;
      const existing = uniqueProgress.get(key);
      
      if (!existing || new Date(p.updatedAt) > new Date(existing.updatedAt)) {
        uniqueProgress.set(key, p);
      }
    });
    
    return Array.from(uniqueProgress.values());
  }

  /**
   * Generates a summary report for a specific time period
   */
  static generateProgressReport(
    progress: GoalProgress[],
    startDate: Date,
    endDate: Date
  ): {
    totalWords: number;
    totalDays: number;
    averageWordsPerDay: number;
    bestDay: { date: string; words: number } | null;
    worstDay: { date: string; words: number } | null;
  } {
    const filteredProgress = progress.filter(p => {
      const date = new Date(p.date);
      return date >= startDate && date <= endDate;
    });

    if (filteredProgress.length === 0) {
      return {
        totalWords: 0,
        totalDays: 0,
        averageWordsPerDay: 0,
        bestDay: null,
        worstDay: null,
      };
    }

    const totalWords = filteredProgress.reduce((sum, p) => sum + p.wordsWritten, 0);
    const totalDays = filteredProgress.length;
    const averageWordsPerDay = Math.round(totalWords / totalDays);

    // Find best and worst days
    const sortedByWords = [...filteredProgress].sort((a, b) => b.wordsWritten - a.wordsWritten);
    const bestDay = {
      date: sortedByWords[0].date,
      words: sortedByWords[0].wordsWritten,
    };
    const worstDay = {
      date: sortedByWords[sortedByWords.length - 1].date,
      words: sortedByWords[sortedByWords.length - 1].wordsWritten,
    };

    return {
      totalWords,
      totalDays,
      averageWordsPerDay,
      bestDay,
      worstDay,
    };
  }
}