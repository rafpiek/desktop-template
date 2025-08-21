'use client';

import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '../tiptap-types';
import type { Document, DocumentStatus, ProjectTag } from '@/lib/types/project';

// Storage key patterns - using original clean pattern
export const getDocumentStorageKey = (documentId: string): string => 
  `document-data-${documentId}`;

// Get backup storage key for JSON export
export const getDocumentBackupKey = (documentId: string): string => 
  `document-backup-${documentId}`;

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
    
    if (node.type === 'text' && node.text) {
      return node.text;
    }
    
    if (node.content && Array.isArray(node.content)) {
      // Join with space to properly separate blocks (paragraphs, headings, etc.)
      // This ensures words at block boundaries don't merge together
      return node.content.map(extractText).join(' ');
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