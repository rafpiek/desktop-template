import { useState, useCallback, useRef } from 'react';
import { BackupService, type BackupResult, type BackupOptions } from '@/lib/services/backup-service';
import { getBackupFileSystem } from '@/lib/services/file-system';
import { useProject } from '@/contexts/project-context';
import { useBackupPath } from './use-backup-path';
import type { Project } from '@/lib/types/project';

export interface BackupProgress {
  current: number;
  total: number;
  status: string;
  percentage: number;
}

export interface UseBackupReturn {
  isBackingUp: boolean;
  progress: BackupProgress | null;
  lastResult: BackupResult | null;
  backupProject: (project: Project, options?: BackupOptions) => Promise<BackupResult>;
  cancelBackup: () => void;
  resetState: () => void;
}

export function useBackup(): UseBackupReturn {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [lastResult, setLastResult] = useState<BackupResult | null>(null);
  const backupServiceRef = useRef<BackupService | null>(null);
  
  const { getProject, getProjectChapters, documents, chapters } = useProject();
  const { backupPath, directoryInfo } = useBackupPath();

  const backupProject = useCallback(async (
    project: Project,
    options: BackupOptions = {}
  ): Promise<BackupResult> => {
    // Check if backup path is configured
    const effectiveBackupPath = directoryInfo?.handle || backupPath;
    if (!effectiveBackupPath) {
      const result: BackupResult = {
        success: false,
        error: 'No backup directory configured. Please configure a backup directory in settings.'
      };
      setLastResult(result);
      return result;
    }

    // Get file system service
    const fileSystem = await getBackupFileSystem(effectiveBackupPath);
    if (!fileSystem) {
      const result: BackupResult = {
        success: false,
        error: 'Failed to access backup directory. Please check permissions and try again.'
      };
      setLastResult(result);
      return result;
    }

    setIsBackingUp(true);
    setProgress(null);
    setLastResult(null);

    try {
      // Create backup service
      const backupService = new BackupService(fileSystem);
      backupServiceRef.current = backupService;

      // Get project data
      const projectChapters = getProjectChapters(project.id);
      const projectDocuments = documents.filter(doc => doc.projectId === project.id);
      const projectTags = project.tags || [];

      // Perform backup with progress tracking
      const result = await backupService.backupProject(
        project,
        projectChapters,
        projectDocuments,
        projectTags,
        {
          ...options,
          onProgress: (current, total, status) => {
            const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
            setProgress({
              current,
              total,
              status,
              percentage
            });
          }
        }
      );

      setLastResult(result);
      return result;

    } catch (error) {
      const result: BackupResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during backup'
      };
      setLastResult(result);
      return result;

    } finally {
      setIsBackingUp(false);
      backupServiceRef.current = null;
    }
  }, [backupPath, directoryInfo, getProjectChapters, documents]);

  const cancelBackup = useCallback(() => {
    if (backupServiceRef.current) {
      backupServiceRef.current.cancel();
    }
  }, []);

  const resetState = useCallback(() => {
    setIsBackingUp(false);
    setProgress(null);
    setLastResult(null);
    backupServiceRef.current = null;
  }, []);

  return {
    isBackingUp,
    progress,
    lastResult,
    backupProject,
    cancelBackup,
    resetState
  };
}