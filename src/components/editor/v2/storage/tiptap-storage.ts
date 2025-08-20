'use client';

import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '../tiptap-types';

// Following existing pattern: document-data-${id} → tiptap-document-data-${id}
export const getTiptapStorageKey = (documentId: string): string => 
  `tiptap-document-data-${documentId}`;

// Get backup storage key for JSON export
export const getTiptapBackupKey = (documentId: string): string => 
  `tiptap-backup-${documentId}`;

// Default empty document structure
export const getEmptyTiptapDocument = (): TiptapDocumentData => ({
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

// Calculate text statistics from TipTap JSON content
export const calculateTiptapTextStats = (content: TiptapValue): TiptapTextStats => {
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
      return node.content.map(extractText).join('');
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
export const loadTiptapDocumentData = (documentId: string): TiptapDocumentData => {
  if (typeof window === 'undefined') return getEmptyTiptapDocument();

  const storageKey = getTiptapStorageKey(documentId);
  console.log(`📖 TipTap Storage: Loading document data for ${documentId} with key: ${storageKey}`);

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const documentData = JSON.parse(saved) as TiptapDocumentData;
      console.log(`📖 TipTap Storage: Found saved document data for ${documentId}:`, documentData);

      // Validate content structure
      if (!documentData.content || !documentData.content.content) {
        console.warn(`📖 TipTap Storage: Invalid content structure for ${documentId}, using empty document`);
        return getEmptyTiptapDocument();
      }

      // Handle backward compatibility - if character counts are missing, calculate them
      if (documentData.charactersWithSpaces === undefined || documentData.charactersWithoutSpaces === undefined) {
        console.log(`📖 TipTap Storage: Missing character counts for ${documentId}, calculating...`);
        const stats = calculateTiptapTextStats(documentData.content);

        // Update stored data with new fields
        const updatedData: TiptapDocumentData = {
          content: documentData.content,
          wordCount: stats.wordCount,
          charactersWithSpaces: stats.charactersWithSpaces,
          charactersWithoutSpaces: stats.charactersWithoutSpaces,
          lastModified: new Date().toISOString(),
          version: documentData.version || '1.0',
        };
        
        saveTiptapDocumentData(documentId, updatedData);
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
      console.log(`📖 TipTap Storage: No saved data found for ${documentId}, using empty document`);
    }
  } catch (error) {
    console.error('TipTap Storage: Failed to load document data:', error);
  }

  return getEmptyTiptapDocument();
};

// Save document data to localStorage
export const saveTiptapDocumentData = (documentId: string, documentData: TiptapDocumentData): void => {
  if (typeof window === 'undefined') return;

  const storageKey = getTiptapStorageKey(documentId);

  console.log(`💾 TipTap Storage: Saving document data for ${documentId}:`, {
    wordCount: documentData.wordCount,
    charactersWithSpaces: documentData.charactersWithSpaces,
    charactersWithoutSpaces: documentData.charactersWithoutSpaces,
    contentLength: JSON.stringify(documentData.content).length
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(documentData));
    console.log(`💾 TipTap Storage: Successfully saved document data for ${documentId} (${documentData.wordCount} words, ${documentData.charactersWithSpaces} chars)`);
  } catch (error) {
    console.error('TipTap Storage: Failed to save document data:', error);
    
    // Try to free up space by removing old backups
    try {
      const backupKey = getTiptapBackupKey(documentId);
      localStorage.removeItem(backupKey);
      console.log('TipTap Storage: Removed old backup to free space');
      
      // Retry saving
      localStorage.setItem(storageKey, JSON.stringify(documentData));
      console.log(`💾 TipTap Storage: Successfully saved document data after cleanup for ${documentId}`);
    } catch (retryError) {
      console.error('TipTap Storage: Failed to save even after cleanup:', retryError);
    }
  }
};

// Save content with automatic stats calculation
export const saveTiptapContent = (documentId: string, content: TiptapValue): TiptapTextStats => {
  const stats = calculateTiptapTextStats(content);
  const documentData: TiptapDocumentData = {
    content,
    ...stats,
    lastModified: new Date().toISOString(),
    version: '1.0',
  };

  saveTiptapDocumentData(documentId, documentData);
  return stats;
};

// Create backup of document (for export functionality)
export const createTiptapBackup = (documentId: string): void => {
  const documentData = loadTiptapDocumentData(documentId);
  const backupKey = getTiptapBackupKey(documentId);
  
  const backup = {
    ...documentData,
    backupCreated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(backupKey, JSON.stringify(backup));
    console.log(`💾 TipTap Storage: Created backup for ${documentId}`);
  } catch (error) {
    console.error('TipTap Storage: Failed to create backup:', error);
  }
};

// Get all TipTap document IDs (for migration/cleanup)
export const getAllTiptapDocumentIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  const documentIds: string[] = [];
  const prefix = 'tiptap-document-data-';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const documentId = key.substring(prefix.length);
      documentIds.push(documentId);
    }
  }

  return documentIds;
};

// Cleanup old TipTap data (for maintenance)
export const cleanupOldTiptapData = (retentionDays: number = 30): number => {
  if (typeof window === 'undefined') return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  let cleanedCount = 0;
  const documentIds = getAllTiptapDocumentIds();

  for (const documentId of documentIds) {
    try {
      const data = loadTiptapDocumentData(documentId);
      const lastModified = new Date(data.lastModified);

      if (lastModified < cutoffDate) {
        const storageKey = getTiptapStorageKey(documentId);
        const backupKey = getTiptapBackupKey(documentId);
        
        localStorage.removeItem(storageKey);
        localStorage.removeItem(backupKey);
        
        cleanedCount++;
        console.log(`🧹 TipTap Storage: Cleaned up old data for ${documentId}`);
      }
    } catch (error) {
      console.error(`TipTap Storage: Error cleaning up ${documentId}:`, error);
    }
  }

  console.log(`🧹 TipTap Storage: Cleaned up ${cleanedCount} old documents`);
  return cleanedCount;
};