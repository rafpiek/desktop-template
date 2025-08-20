'use client';

import type { TiptapValue, TiptapDocumentData } from '../tiptap-types';
import { loadTiptapDocumentData, getTiptapStorageKey } from './tiptap-storage';
import { tiptapToMarkdown } from '@/lib/utils/tiptap-content-utils';

// Backup formats
export type BackupFormat = 'json' | 'markdown' | 'both';

// Backup data structure
export interface TiptapBackup {
  documentId: string;
  title?: string;
  createdAt: string;
  format: BackupFormat;
  data: {
    json?: TiptapDocumentData;
    markdown?: string;
  };
  metadata: {
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
    version: string;
  };
}

// Create backup for a specific document
export const createTiptapBackup = (
  documentId: string, 
  format: BackupFormat = 'both',
  title?: string
): TiptapBackup | null => {
  if (typeof window === 'undefined') return null;

  try {
    const documentData = loadTiptapDocumentData(documentId);
    
    const backup: TiptapBackup = {
      documentId,
      title: title || `Document ${documentId}`,
      createdAt: new Date().toISOString(),
      format,
      data: {},
      metadata: {
        wordCount: documentData.wordCount,
        charactersWithSpaces: documentData.charactersWithSpaces,
        charactersWithoutSpaces: documentData.charactersWithoutSpaces,
        version: documentData.version || '1.0',
      },
    };

    // Add JSON backup if requested
    if (format === 'json' || format === 'both') {
      backup.data.json = documentData;
    }

    // Add Markdown backup if requested
    if (format === 'markdown' || format === 'both') {
      backup.data.markdown = tiptapToMarkdown(documentData.content);
    }

    console.log(`💾 TipTap Backup: Created backup for ${documentId}`, backup);
    return backup;
  } catch (error) {
    console.error('TipTap Backup: Error creating backup:', error);
    return null;
  }
};

// Save backup to localStorage
export const saveTiptapBackup = (backup: TiptapBackup): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const backupKey = `tiptap-backup-${backup.documentId}-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    
    console.log(`💾 TipTap Backup: Saved backup with key ${backupKey}`);
    return true;
  } catch (error) {
    console.error('TipTap Backup: Error saving backup:', error);
    return false;
  }
};

// Export backup as downloadable file
export const exportTiptapBackup = (
  backup: TiptapBackup, 
  filename?: string
): void => {
  if (typeof window === 'undefined') return;

  try {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (backup.format === 'markdown' && backup.data.markdown) {
      content = backup.data.markdown;
      mimeType = 'text/markdown';
      extension = 'md';
    } else if (backup.format === 'json' && backup.data.json) {
      content = JSON.stringify(backup.data.json, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else if (backup.format === 'both') {
      // Export as a combined file with both formats
      content = JSON.stringify({
        ...backup,
        exportedAt: new Date().toISOString(),
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      throw new Error('Invalid backup format or missing data');
    }

    const defaultFilename = `${backup.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'document'}-backup.${extension}`;
    const finalFilename = filename || defaultFilename;

    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📄 TipTap Backup: Exported ${finalFilename}`);
  } catch (error) {
    console.error('TipTap Backup: Error exporting backup:', error);
  }
};

// Create and export backup in one step
export const createAndExportTiptapBackup = (
  documentId: string,
  format: BackupFormat = 'both',
  title?: string,
  filename?: string
): void => {
  const backup = createTiptapBackup(documentId, format, title);
  if (backup) {
    exportTiptapBackup(backup, filename);
  }
};

// Get all backups from localStorage
export const getAllTiptapBackups = (): TiptapBackup[] => {
  if (typeof window === 'undefined') return [];

  const backups: TiptapBackup[] = [];
  const prefix = 'tiptap-backup-';

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const backupData = localStorage.getItem(key);
        if (backupData) {
          const backup = JSON.parse(backupData) as TiptapBackup;
          backups.push(backup);
        }
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`📋 TipTap Backup: Found ${backups.length} backups`);
    return backups;
  } catch (error) {
    console.error('TipTap Backup: Error loading backups:', error);
    return [];
  }
};

// Delete old backups (cleanup)
export const cleanupOldTiptapBackups = (retentionDays: number = 30): number => {
  if (typeof window === 'undefined') return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  let deletedCount = 0;
  const prefix = 'tiptap-backup-';

  try {
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const backupData = localStorage.getItem(key);
        if (backupData) {
          const backup = JSON.parse(backupData) as TiptapBackup;
          const createdDate = new Date(backup.createdAt);
          
          if (createdDate < cutoffDate) {
            keysToDelete.push(key);
          }
        }
      }
    }

    // Delete old backups
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      deletedCount++;
    });

    console.log(`🧹 TipTap Backup: Cleaned up ${deletedCount} old backups`);
    return deletedCount;
  } catch (error) {
    console.error('TipTap Backup: Error cleaning up backups:', error);
    return 0;
  }
};

// Restore document from backup
export const restoreTiptapFromBackup = (backup: TiptapBackup): boolean => {
  if (typeof window === 'undefined' || !backup.data.json) return false;

  try {
    const storageKey = getTiptapStorageKey(backup.documentId);
    localStorage.setItem(storageKey, JSON.stringify(backup.data.json));
    
    console.log(`🔄 TipTap Backup: Restored document ${backup.documentId} from backup`);
    return true;
  } catch (error) {
    console.error('TipTap Backup: Error restoring from backup:', error);
    return false;
  }
};

// Auto-backup functionality (call periodically)
export const autoBackupTiptapDocument = (documentId: string, title?: string): void => {
  const lastAutoBackupKey = `tiptap-last-auto-backup-${documentId}`;
  const lastBackup = localStorage.getItem(lastAutoBackupKey);
  
  const now = Date.now();
  const autoBackupInterval = 1000 * 60 * 30; // 30 minutes

  if (!lastBackup || (now - parseInt(lastBackup)) > autoBackupInterval) {
    const backup = createTiptapBackup(documentId, 'json', title);
    if (backup && saveTiptapBackup(backup)) {
      localStorage.setItem(lastAutoBackupKey, now.toString());
      console.log(`🔄 TipTap Backup: Auto-backup completed for ${documentId}`);
    }
  }
};