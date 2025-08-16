import type { Project, Document, Chapter, ProjectTag } from '@/lib/types/project';
import { createFileName, createDirectoryName } from '@/lib/utils/slug';
import { 
  exportDocumentToMarkdown, 
  exportDocumentToJson, 
  exportChapterToJson,
  exportProjectToJson 
} from './content-serializer';
import type { FileSystemService } from './file-system';

// Progress callback type
export type BackupProgressCallback = (
  current: number, 
  total: number, 
  status: string
) => void;

// Backup result type
export interface BackupResult {
  success: boolean;
  backupPath?: string;
  timestamp?: number;
  error?: string;
  filesBackedUp?: number;
}

// Backup options
export interface BackupOptions {
  includeDrafts?: boolean;
  includeChapters?: boolean;
  onProgress?: BackupProgressCallback;
}

/**
 * Main backup service class
 */
export class BackupService {
  private fileSystem: FileSystemService;
  private cancelled: boolean = false;

  constructor(fileSystem: FileSystemService) {
    this.fileSystem = fileSystem;
  }

  /**
   * Cancel the current backup operation
   */
  public cancel() {
    this.cancelled = true;
  }

  /**
   * Backup a project with all its documents and chapters
   */
  async backupProject(
    project: Project,
    chapters: Chapter[],
    documents: Document[],
    tags: ProjectTag[],
    options: BackupOptions = {}
  ): Promise<BackupResult> {
    const {
      includeDrafts = true,
      includeChapters = true,
      onProgress
    } = options;

    this.cancelled = false;
    const timestamp = Date.now();
    const projectDirName = createDirectoryName(project.name || 'untitled-project');
    const backupDirName = `backup-${timestamp}`;
    const backupPath = this.fileSystem.joinPath('projects', projectDirName, backupDirName);

    try {
      // Calculate total steps for progress tracking
      const drafts = documents.filter(doc => !doc.chapterId);
      const chapterDocs = documents.filter(doc => doc.chapterId);
      
      let totalSteps = 1; // project.json
      if (includeDrafts) {
        totalSteps += drafts.length * 2; // .md and .json for each draft
      }
      if (includeChapters) {
        totalSteps += chapters.length; // chapter.json for each chapter
        totalSteps += chapterDocs.length * 2; // .md and .json for each document
      }

      let currentStep = 0;

      // Report initial progress
      onProgress?.(currentStep, totalSteps, 'Starting backup...');

      // Create backup root directory
      await this.fileSystem.createDirectory(backupPath);

      // Check if cancelled
      if (this.cancelled) {
        throw new Error('Backup cancelled by user');
      }

      // Export project metadata
      onProgress?.(currentStep++, totalSteps, 'Backing up project metadata...');
      const projectData = exportProjectToJson(project, chapters, documents, tags);
      await this.fileSystem.writeJsonFile(
        this.fileSystem.joinPath(backupPath, 'project.json'),
        projectData
      );

      // Check if cancelled
      if (this.cancelled) {
        throw new Error('Backup cancelled by user');
      }

      // Backup drafts
      if (includeDrafts && drafts.length > 0) {
        const draftsPath = this.fileSystem.joinPath(backupPath, 'drafts');
        await this.fileSystem.createDirectory(draftsPath);

        for (const draft of drafts) {
          if (this.cancelled) {
            throw new Error('Backup cancelled by user');
          }

          const fileName = createFileName(draft.title || 'untitled', draft.id);
          
          // Export markdown
          onProgress?.(currentStep++, totalSteps, `Backing up draft: ${draft.title}...`);
          const markdown = exportDocumentToMarkdown(draft);
          await this.fileSystem.writeTextFile(
            this.fileSystem.joinPath(draftsPath, `${fileName}.md`),
            markdown
          );

          // Export JSON
          onProgress?.(currentStep++, totalSteps, `Backing up draft metadata: ${draft.title}...`);
          const json = exportDocumentToJson(draft);
          await this.fileSystem.writeJsonFile(
            this.fileSystem.joinPath(draftsPath, `${fileName}.json`),
            json
          );
        }
      }

      // Backup chapters and their documents
      if (includeChapters && chapters.length > 0) {
        const chaptersPath = this.fileSystem.joinPath(backupPath, 'chapters');
        await this.fileSystem.createDirectory(chaptersPath);

        for (const chapter of chapters) {
          if (this.cancelled) {
            throw new Error('Backup cancelled by user');
          }

          const chapterDirName = createDirectoryName(chapter.title || 'untitled-chapter', chapter.order);
          const chapterPath = this.fileSystem.joinPath(chaptersPath, chapterDirName);
          await this.fileSystem.createDirectory(chapterPath);

          // Export chapter metadata
          onProgress?.(currentStep++, totalSteps, `Backing up chapter: ${chapter.title}...`);
          const chapterJson = exportChapterToJson(chapter);
          await this.fileSystem.writeJsonFile(
            this.fileSystem.joinPath(chapterPath, 'chapter.json'),
            chapterJson
          );

          // Export chapter documents
          const chapterDocuments = chapterDocs.filter(doc => doc.chapterId === chapter.id);
          for (const doc of chapterDocuments) {
            if (this.cancelled) {
              throw new Error('Backup cancelled by user');
            }

            const fileName = createFileName(doc.title || 'untitled', doc.id);

            // Export markdown
            onProgress?.(currentStep++, totalSteps, `Backing up document: ${doc.title}...`);
            const markdown = exportDocumentToMarkdown(doc);
            await this.fileSystem.writeTextFile(
              this.fileSystem.joinPath(chapterPath, `${fileName}.md`),
              markdown
            );

            // Export JSON
            onProgress?.(currentStep++, totalSteps, `Backing up document metadata: ${doc.title}...`);
            const json = exportDocumentToJson(doc);
            await this.fileSystem.writeJsonFile(
              this.fileSystem.joinPath(chapterPath, `${fileName}.json`),
              json
            );
          }
        }
      }

      // Final progress update
      onProgress?.(totalSteps, totalSteps, 'Backup completed successfully!');

      return {
        success: true,
        backupPath,
        timestamp,
        filesBackedUp: currentStep
      };

    } catch (error) {
      console.error('Backup failed:', error);
      
      // Attempt to clean up partial backup
      // Note: We don't have a delete method in our FileSystemService yet,
      // so we'll leave the partial backup for now
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        backupPath,
        timestamp
      };
    }
  }

  /**
   * Get human-readable backup info
   */
  static getBackupInfo(timestamp: number): { date: string; time: string } {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  }
}