import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useGoals } from '@/hooks/use-goals';
import { useProjects } from '@/hooks/use-projects';
import { useDocuments } from '@/hooks/use-documents';
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
  CalendarDayData,
} from '@/lib/types/goals';

interface GoalsContextValue {
  // Data
  goals: WritingGoal[];
  progress: GoalProgress[];
  settings: GoalSettings;
  stats: GoalStats;
  
  // Goal CRUD
  createGoal: (input: CreateGoalInput) => WritingGoal;
  updateGoal: (input: UpdateGoalInput) => void;
  deleteGoal: (id: string) => void;
  getActiveGoals: () => WritingGoal[];
  getGoalByType: (type: GoalPeriod) => WritingGoal | undefined;
  
  // Progress CRUD
  upsertProgress: (input: CreateProgressInput) => void;
  updateProgress: (input: UpdateProgressInput) => void;
  getProgressForGoal: (goalId: string, startDate?: Date, endDate?: Date) => GoalProgress[];
  getTodayProgress: () => GoalProgress[];
  
  // Statistics
  getCalendarData: (year: number, month: number) => CalendarDayData[];
  
  // Settings
  updateSettings: (updates: Partial<GoalSettings>) => void;
  
  // Auto-tracking
  trackDocumentChange: (documentId: string, projectId: string, wordCount: number, charCount: number) => void;
  syncProgressFromDocuments: () => void;
}

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

interface GoalsProviderProps {
  children: ReactNode;
}

export function GoalsProvider({ children }: GoalsProviderProps) {
  const {
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
    calculateAllStats,
    getCalendarData,
    updateSettings,
    initializeDefaultGoals,
  } = useGoals();

  const { projects } = useProjects();
  const { documents } = useDocuments();

  // Calculate stats
  const stats = calculateAllStats();

  // Track document changes and update progress
  const trackDocumentChange = useCallback((
    documentId: string,
    projectId: string,
    wordCount: number,
    charCount: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all active goals
    const activeGoals = getActiveGoals();
    
    activeGoals.forEach(goal => {
      // Check if this change should contribute to this goal
      const shouldTrack = shouldTrackForGoal(goal, today);
      
      if (shouldTrack) {
        // Get existing progress for today
        const existingProgress = progress.find(
          p => p.goalId === goal.id && p.date.startsWith(today)
        );
        
        // Calculate new totals
        let newWordCount = wordCount;
        let newCharCount = charCount;
        let documentIds = [documentId];
        let projectIds = [projectId];
        
        if (existingProgress) {
          // Merge with existing progress
          documentIds = [...new Set([...existingProgress.documentIds, documentId])];
          projectIds = [...new Set([...existingProgress.projectIds, projectId])];
          
          // For simplicity, we'll recalculate from all documents
          // In a real app, you'd want to track deltas more carefully
          newWordCount = existingProgress.wordsWritten + wordCount;
          newCharCount = existingProgress.charsWritten + charCount;
        }
        
        // Update progress
        upsertProgress({
          goalId: goal.id,
          date: today,
          wordsWritten: newWordCount,
          charsWritten: newCharCount,
          projectIds,
          documentIds,
        });
      }
    });
  }, [getActiveGoals, progress, upsertProgress]);

  // Sync progress from all documents (for initial load and background sync)
  const syncProgressFromDocuments = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Group documents by their last update date
    const documentsByDate: Record<string, typeof documents> = {};
    
    documents.forEach(doc => {
      const date = new Date(doc.updatedAt).toISOString().split('T')[0];
      if (!documentsByDate[date]) {
        documentsByDate[date] = [];
      }
      documentsByDate[date].push(doc);
    });
    
    // For each date, calculate total words written
    Object.entries(documentsByDate).forEach(([date, docs]) => {
      const totalWords = docs.reduce((sum, doc) => sum + doc.wordCount, 0);
      const totalChars = totalWords * 5; // Rough estimate of characters
      const projectIds = [...new Set(docs.map(d => d.projectId))];
      const documentIds = docs.map(d => d.id);
      
      // Find the appropriate goal for this date
      const activeGoals = getActiveGoals();
      
      activeGoals.forEach(goal => {
        if (shouldTrackForGoal(goal, date)) {
          upsertProgress({
            goalId: goal.id,
            date,
            wordsWritten: totalWords,
            charsWritten: totalChars,
            projectIds,
            documentIds,
          });
        }
      });
    });
  }, [documents, getActiveGoals, upsertProgress]);

  // Helper function to determine if a change should be tracked for a goal
  const shouldTrackForGoal = (goal: WritingGoal, date: string): boolean => {
    const goalStart = new Date(goal.startDate);
    const goalEnd = new Date(goal.endDate);
    const checkDate = new Date(date);
    
    return checkDate >= goalStart && checkDate <= goalEnd && goal.isActive;
  };

  // Initialize default goals on mount only
  useEffect(() => {
    initializeDefaultGoals();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Archive old goals when setting changes
  useEffect(() => {
    if (settings.autoArchiveOldGoals) {
      archiveOldGoals();
    }
  }, [settings.autoArchiveOldGoals, archiveOldGoals]);

  // Sync progress from documents when documents change
  useEffect(() => {
    syncProgressFromDocuments();
  }, [documents, syncProgressFromDocuments]);

  const contextValue: GoalsContextValue = {
    // Data
    goals,
    progress,
    settings,
    stats,
    
    // Goal CRUD
    createGoal,
    updateGoal,
    deleteGoal,
    getActiveGoals,
    getGoalByType,
    
    // Progress CRUD
    upsertProgress,
    updateProgress,
    getProgressForGoal,
    getTodayProgress,
    
    // Statistics
    getCalendarData,
    
    // Settings
    updateSettings,
    
    // Auto-tracking
    trackDocumentChange,
    syncProgressFromDocuments,
  };

  return (
    <GoalsContext.Provider value={contextValue}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoalsContext() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoalsContext must be used within a GoalsProvider');
  }
  return context;
}