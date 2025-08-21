'use client';

import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '../tiptap-types';
import type { Document, DocumentStatus, ProjectTag } from '@/lib/types/project';

// Writing Session Tracking Types
export interface WritingSession {
  id: string;
  documentId: string;
  projectId?: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  baselineWordCount: number; // Word count when session started
  currentWordCount: number; // Current word count
  wordsAdded: number; // Words added during this session
  date: string; // Date in YYYY-MM-DD format
  isActive: boolean;
}

export interface DailyWritingProgress {
  date: string; // YYYY-MM-DD format
  totalWordsAdded: number; // Total words added across all sessions today
  sessions: WritingSession[];
  documentIds: string[];
  projectIds: string[];
}

// Storage key patterns - using original clean pattern
export const getDocumentStorageKey = (documentId: string): string =>
  `document-data-${documentId}`;

// Get backup storage key for JSON export
export const getDocumentBackupKey = (documentId: string): string =>
  `document-backup-${documentId}`;

// Writing session storage keys
export const getSessionStorageKey = (documentId: string): string =>
  `writing-session-${documentId}`;

export const getDailyProgressStorageKey = (date: string): string =>
  `daily-progress-${date}`;

// Default empty document structure
export const getEmptyDocumentData = (): TiptapDocumentData => ({
  content: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      }
    ]
  },
  wordCount: 0,
  charactersWithSpaces: 0,
  charactersWithoutSpaces: 0,
  lastModified: new Date().toISOString(),
  version: '1.0',
});

// Calculate text statistics from editor content
export const calculateTextStats = (content: TiptapValue): TiptapTextStats => {
  if (!content || !content.content) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  const extractText = (node: unknown): string => {
    if (!node) return '';

    if (typeof node === 'string') return node;

    const nodeObj = node as any;
    if (nodeObj.type === 'text' && nodeObj.text) {
      return nodeObj.text;
    }

    if (nodeObj.content && Array.isArray(nodeObj.content)) {
      // Join with space to properly separate blocks (paragraphs, headings, etc.)
      // This ensures words at block boundaries don't merge together
      return nodeObj.content.map(extractText).join(' ');
    }

    return '';
  };

  const fullText = extractText(content);

  if (!fullText.trim()) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  // Calculate all metrics at once for efficiency
  const charactersWithSpaces = fullText.length;
  const charactersWithoutSpaces = fullText.replace(/\s/g, '').length;
  const wordCount = fullText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return { wordCount, charactersWithSpaces, charactersWithoutSpaces };
};

// Load document data from localStorage
export const loadDocumentData = (documentId: string): TiptapDocumentData => {
  if (typeof window === 'undefined') return getEmptyDocumentData();

  const storageKey = getDocumentStorageKey(documentId);

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const documentData = JSON.parse(saved) as TiptapDocumentData;

      // Validate content structure
      if (!documentData.content || !documentData.content.content) {
        return getEmptyDocumentData();
      }

      // Handle backward compatibility - if character counts are missing, calculate them
      if (documentData.charactersWithSpaces === undefined || documentData.charactersWithoutSpaces === undefined) {
        const stats = calculateTextStats(documentData.content);

        // Update stored data with new fields
        const updatedData: TiptapDocumentData = {
          content: documentData.content,
          wordCount: stats.wordCount,
          charactersWithSpaces: stats.charactersWithSpaces,
          charactersWithoutSpaces: stats.charactersWithoutSpaces,
          lastModified: new Date().toISOString(),
          version: documentData.version || '1.0',
        };

        saveDocumentData(documentId, updatedData);
        return updatedData;
      }

      return {
        content: documentData.content,
        wordCount: documentData.wordCount || 0,
        charactersWithSpaces: documentData.charactersWithSpaces || 0,
        charactersWithoutSpaces: documentData.charactersWithoutSpaces || 0,
        lastModified: documentData.lastModified || new Date().toISOString(),
        version: documentData.version || '1.0',
      };
    } else {
    }
  } catch (error) {
  }

  return getEmptyDocumentData();
};

// Save document data to localStorage
export const saveDocumentData = (documentId: string, documentData: TiptapDocumentData): void => {
  if (typeof window === 'undefined') return;

  const storageKey = getDocumentStorageKey(documentId);


  try {
    localStorage.setItem(storageKey, JSON.stringify(documentData));
  } catch (error) {

    // Try to free up space by removing old backups
    try {
      const backupKey = getDocumentBackupKey(documentId);
      localStorage.removeItem(backupKey);

      // Retry saving
      localStorage.setItem(storageKey, JSON.stringify(documentData));
    } catch (retryError) {
    }
  }
};

// Save content with automatic stats calculation
export const saveDocumentContent = (documentId: string, content: TiptapValue): TiptapTextStats => {
  const stats = calculateTextStats(content);
  const documentData: TiptapDocumentData = {
    content,
    ...stats,
    lastModified: new Date().toISOString(),
    version: '1.0',
  };

  saveDocumentData(documentId, documentData);
  return stats;
};

// Create backup of document (for export functionality)
export const createDocumentBackup = (documentId: string): void => {
  const documentData = loadDocumentData(documentId);
  const backupKey = getDocumentBackupKey(documentId);

  const backup = {
    ...documentData,
    backupCreated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(backupKey, JSON.stringify(backup));
  } catch (error) {
  }
};

//==============================
// WRITING SESSION TRACKING
//==============================

// Generate unique session ID
const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Get today's date in YYYY-MM-DD format
const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Start a new writing session
export const startWritingSession = (
  documentId: string, 
  baselineWordCount: number, 
  projectId?: string
): WritingSession => {
  if (typeof window === 'undefined') {
    throw new Error('Writing sessions only available in browser environment');
  }

  const now = new Date().toISOString();
  const session: WritingSession = {
    id: generateSessionId(),
    documentId,
    projectId,
    startTime: now,
    baselineWordCount,
    currentWordCount: baselineWordCount,
    wordsAdded: 0,
    date: getTodayDateKey(),
    isActive: true,
  };

  // Store session
  const sessionKey = getSessionStorageKey(documentId);
  try {
    localStorage.setItem(sessionKey, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save writing session:', error);
  }

  return session;
};

// Update current writing session with new word count
export const updateWritingSession = (documentId: string, currentWordCount: number): WritingSession | null => {
  if (typeof window === 'undefined') return null;

  const sessionKey = getSessionStorageKey(documentId);
  
  try {
    const stored = localStorage.getItem(sessionKey);
    if (!stored) return null;

    const session: WritingSession = JSON.parse(stored);
    if (!session.isActive) return null;

    // Calculate words added during this session
    const wordsAdded = Math.max(0, currentWordCount - session.baselineWordCount);
    
    const updatedSession: WritingSession = {
      ...session,
      currentWordCount,
      wordsAdded,
    };

    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
    return updatedSession;
  } catch (error) {
    console.error('Failed to update writing session:', error);
    return null;
  }
};

// End current writing session
export const endWritingSession = (documentId: string): WritingSession | null => {
  if (typeof window === 'undefined') return null;

  const sessionKey = getSessionStorageKey(documentId);
  
  try {
    const stored = localStorage.getItem(sessionKey);
    if (!stored) return null;

    const session: WritingSession = JSON.parse(stored);
    if (!session.isActive) return session;

    const now = new Date().toISOString();
    const endedSession: WritingSession = {
      ...session,
      endTime: now,
      isActive: false,
    };

    localStorage.setItem(sessionKey, JSON.stringify(endedSession));

    // Add session to daily progress
    addSessionToDailyProgress(endedSession);

    return endedSession;
  } catch (error) {
    console.error('Failed to end writing session:', error);
    return null;
  }
};

// Get current active session for a document
export const getCurrentSession = (documentId: string): WritingSession | null => {
  if (typeof window === 'undefined') return null;

  const sessionKey = getSessionStorageKey(documentId);
  
  try {
    const stored = localStorage.getItem(sessionKey);
    if (!stored) return null;

    const session: WritingSession = JSON.parse(stored);
    return session.isActive ? session : null;
  } catch (error) {
    console.error('Failed to get current session:', error);
    return null;
  }
};

// Add session to daily progress tracking
const addSessionToDailyProgress = (session: WritingSession): void => {
  if (typeof window === 'undefined') return;
  if (session.wordsAdded <= 0) return; // Only track sessions with actual words added

  const progressKey = getDailyProgressStorageKey(session.date);
  
  try {
    const stored = localStorage.getItem(progressKey);
    let dailyProgress: DailyWritingProgress;

    if (stored) {
      dailyProgress = JSON.parse(stored);
    } else {
      dailyProgress = {
        date: session.date,
        totalWordsAdded: 0,
        sessions: [],
        documentIds: [],
        projectIds: [],
      };
    }

    // Add session to daily progress
    dailyProgress.sessions.push(session);
    dailyProgress.totalWordsAdded += session.wordsAdded;
    
    // Track unique documents and projects
    if (!dailyProgress.documentIds.includes(session.documentId)) {
      dailyProgress.documentIds.push(session.documentId);
    }
    if (session.projectId && !dailyProgress.projectIds.includes(session.projectId)) {
      dailyProgress.projectIds.push(session.projectId);
    }

    localStorage.setItem(progressKey, JSON.stringify(dailyProgress));
  } catch (error) {
    console.error('Failed to add session to daily progress:', error);
  }
};

// Get daily progress for a specific date
export const getDailyProgress = (date: string): DailyWritingProgress | null => {
  if (typeof window === 'undefined') return null;

  const progressKey = getDailyProgressStorageKey(date);
  
  try {
    const stored = localStorage.getItem(progressKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get daily progress:', error);
    return null;
  }
};

// Get today's writing progress
export const getTodayProgress = (): DailyWritingProgress | null => {
  return getDailyProgress(getTodayDateKey());
};

// Get all active sessions (across all documents)
export const getAllActiveSessions = (): WritingSession[] => {
  if (typeof window === 'undefined') return [];

  const sessions: WritingSession[] = [];
  const prefix = 'writing-session-';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const session: WritingSession = JSON.parse(stored);
          if (session.isActive) {
            sessions.push(session);
          }
        }
      } catch (error) {
        console.error('Failed to parse session:', error);
      }
    }
  }

  return sessions;
};

// Clean up old sessions (keep only last 7 days)
export const cleanupOldSessions = (): number => {
  if (typeof window === 'undefined') return 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

  let cleanedCount = 0;
  const sessionPrefix = 'writing-session-';
  const progressPrefix = 'daily-progress-';

  // Clean up sessions
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(sessionPrefix)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const session: WritingSession = JSON.parse(stored);
          if (session.date < cutoffDate) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  }

  // Clean up daily progress
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(progressPrefix)) {
      const dateFromKey = key.substring(progressPrefix.length);
      if (dateFromKey < cutoffDate) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  }

  return cleanedCount;
};

//==============================
// GOAL PROGRESS INTEGRATION
//==============================

// Convert daily progress to GoalProgress format for backward compatibility
export const convertDailyProgressToGoalProgress = (dailyProgress: DailyWritingProgress, goalId: string = 'daily'): {
  id: string;
  goalId: string;
  date: string;
  wordsWritten: number;
  charsWritten: number;
  projectIds: string[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
} => {
  const now = new Date().toISOString();
  return {
    id: `progress-${dailyProgress.date}`,
    goalId,
    date: dailyProgress.date,
    wordsWritten: dailyProgress.totalWordsAdded,
    charsWritten: dailyProgress.totalWordsAdded * 5, // Rough estimate
    projectIds: dailyProgress.projectIds,
    documentIds: dailyProgress.documentIds,
    createdAt: now,
    updatedAt: now,
  };
};

// Get daily progress in GoalProgress format
export const getDailyProgressAsGoalProgress = (date: string, goalId: string = 'daily') => {
  const dailyProgress = getDailyProgress(date);
  if (!dailyProgress) return null;
  
  return convertDailyProgressToGoalProgress(dailyProgress, goalId);
};

// Get today's progress in GoalProgress format
export const getTodayProgressAsGoalProgress = (goalId: string = 'daily') => {
  const today = new Date().toISOString().split('T')[0];
  return getDailyProgressAsGoalProgress(today, goalId);
};

// Get progress for a date range in GoalProgress format
export const getProgressRangeAsGoalProgress = (startDate: string, endDate: string, goalId: string = 'daily') => {
  const progressEntries = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    const dateKey = current.toISOString().split('T')[0];
    const dayProgress = getDailyProgressAsGoalProgress(dateKey, goalId);
    
    if (dayProgress) {
      progressEntries.push(dayProgress);
    }

    current.setDate(current.getDate() + 1);
  }

  return progressEntries;
};

// Sync session data with external goal tracking systems
export const syncWithGoalSystem = (onProgressUpdate?: (progress: any) => void) => {
  if (typeof window === 'undefined') return;

  // Get today's progress and notify external systems
  const todayProgress = getTodayProgressAsGoalProgress();
  if (todayProgress && onProgressUpdate) {
    onProgressUpdate(todayProgress);
  }
};

// Get aggregate stats for goal calculations
export const getSessionBasedStats = () => {
  const today = getTodayProgress();
  const todayWords = today?.totalWordsAdded || 0;
  
  // Calculate week and month totals
  let weekWords = 0;
  let monthWords = 0;
  let activeDays = 0;
  
  const currentDate = new Date();
  const weekAgo = new Date(currentDate);
  weekAgo.setDate(currentDate.getDate() - 7);
  const monthAgo = new Date(currentDate);
  monthAgo.setDate(currentDate.getDate() - 30);
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];
    
    const dayProgress = getDailyProgress(dateKey);
    if (dayProgress && dayProgress.totalWordsAdded > 0) {
      if (checkDate >= weekAgo) {
        weekWords += dayProgress.totalWordsAdded;
      }
      if (checkDate >= monthAgo) {
        monthWords += dayProgress.totalWordsAdded;
        activeDays++;
      }
    }
  }
  
  return {
    todayWords,
    weekWords,
    monthWords,
    activeDays,
    averageWordsPerDay: activeDays > 0 ? Math.round(monthWords / activeDays) : 0,
  };
};

//==============================
// EXISTING DOCUMENT FUNCTIONS
//==============================

// Get all document IDs (for migration/cleanup)
export const getAllDocumentIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  const documentIds: string[] = [];
  const prefix = 'document-data-';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const documentId = key.substring(prefix.length);
      documentIds.push(documentId);
    }
  }

  return documentIds;
};

// Cleanup old document data (for maintenance)
export const cleanupOldDocumentData = (retentionDays: number = 30): number => {
  if (typeof window === 'undefined') return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  let cleanedCount = 0;
  const documentIds = getAllDocumentIds();

  for (const documentId of documentIds) {
    try {
      const data = loadDocumentData(documentId);
      const lastModified = new Date(data.lastModified);

      if (lastModified < cutoffDate) {
        const storageKey = getDocumentStorageKey(documentId);
        const backupKey = getDocumentBackupKey(documentId);

        localStorage.removeItem(storageKey);
        localStorage.removeItem(backupKey);

        cleanedCount++;
      }
    } catch (error) {
    }
  }

  return cleanedCount;
};
