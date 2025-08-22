import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from '@/lib/types/project';
import {
  createEmptyChapter,
} from '@/lib/types/project';

const CHAPTERS_STORAGE_KEY = 'zeyn-chapters';

export function useChapters() {
  const [chapters, setChapters] = useLocalStorage<Chapter[]>(CHAPTERS_STORAGE_KEY, []);

  // Create a new chapter
  const createChapter = useCallback((input: CreateChapterInput) => {
    // Auto-calculate order if not provided
    const projectChapters = chapters.filter(c => c.projectId === input.projectId);
    const maxOrder = projectChapters.length > 0
      ? Math.max(...projectChapters.map(c => c.order))
      : 0;

    const newChapter = createEmptyChapter({
      ...input,
      order: input.order || maxOrder + 1,
    });

    setChapters(prev => [...prev, newChapter]);
    return newChapter;
  }, [chapters, setChapters]);

  // Update an existing chapter
  const updateChapter = useCallback((input: UpdateChapterInput) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.id !== input.id) return chapter;

      const updatedChapter: Chapter = {
        ...chapter,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      return updatedChapter;
    }));
  }, [setChapters]);

  // Delete a chapter
  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(chapter => chapter.id !== id));
  }, [setChapters]);

  // Toggle completion status
  const toggleCompletion = useCallback((id: string) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === id
        ? { ...chapter, isCompleted: !chapter.isCompleted, updatedAt: new Date().toISOString() }
        : chapter
    ));
  }, [setChapters]);

  // Duplicate a chapter
  const duplicateChapter = useCallback((id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (!chapter) return null;

    // Auto-calculate order for duplicated chapter
    const projectChapters = chapters.filter(c => c.projectId === chapter.projectId);
    const maxOrder = projectChapters.length > 0
      ? Math.max(...projectChapters.map(c => c.order))
      : 0;

    const duplicatedChapter: Chapter = {
      ...chapter,
      id: crypto.randomUUID(),
      title: `${chapter.title} (Copy)`,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentIds: [], // Don't copy document references
      wordCount: 0,
      isCompleted: false,
    };

    setChapters(prev => [...prev, duplicatedChapter]);
    return duplicatedChapter;
  }, [chapters, setChapters]);

  // Get a single chapter by ID
  const getChapter = useCallback((id: string): Chapter | undefined => {
    return chapters.find(chapter => chapter.id === id);
  }, [chapters]);

  // Get chapters by project ID (sorted by order)
  const getChaptersByProject = useCallback((projectId: string): Chapter[] => {
    return chapters
      .filter(chapter => chapter.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }, [chapters]);

  // Add document to chapter
  const addDocumentToChapter = useCallback((chapterId: string, documentId: string) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            documentIds: [...chapter.documentIds, documentId],
            updatedAt: new Date().toISOString()
          }
        : chapter
    ));
  }, [setChapters]);

  // Remove document from chapter
  const removeDocumentFromChapter = useCallback((chapterId: string, documentId: string) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            documentIds: chapter.documentIds.filter(id => id !== documentId),
            updatedAt: new Date().toISOString()
          }
        : chapter
    ));
  }, [setChapters]);

  // Update chapter word count
  const updateChapterWordCount = useCallback((chapterId: string, wordCount: number) => {
    setChapters(prev => prev.map(c =>
      c.id === chapterId
        ? { ...c, wordCount, updatedAt: new Date().toISOString() }
        : c
    ));
  }, [setChapters]);

  // Reorder chapters
  const reorderChapters = useCallback((projectId: string, chapterIds: string[]) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.projectId !== projectId) return chapter;

      const newOrder = chapterIds.indexOf(chapter.id) + 1;
      return newOrder > 0
        ? { ...chapter, order: newOrder, updatedAt: new Date().toISOString() }
        : chapter;
    }));
  }, [setChapters]);

  // Get recent chapters (last 5 updated)
  const recentChapters = useMemo(() => {
    return [...chapters]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [chapters]);

  // Get completed chapters
  const completedChapters = useMemo(() => {
    return chapters.filter(chapter => chapter.isCompleted);
  }, [chapters]);

  // Get chapter statistics for a project
  const getProjectChapterStats = useCallback((projectId: string) => {
    const projectChapters = chapters.filter(c => c.projectId === projectId);
    const totalWords = projectChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
    const completedCount = projectChapters.filter(c => c.isCompleted).length;
    const totalDocuments = projectChapters.reduce((sum, chapter) => sum + chapter.documentIds.length, 0);

    return {
      totalChapters: projectChapters.length,
      totalWords,
      completedChapters: completedCount,
      totalDocuments,
      averageWordsPerChapter: projectChapters.length > 0 ? Math.round(totalWords / projectChapters.length) : 0,
      completionPercentage: projectChapters.length > 0 ? Math.round((completedCount / projectChapters.length) * 100) : 0,
    };
  }, [chapters]);

  // Export chapters for a project
  const exportProjectChapters = useCallback((projectId: string) => {
    const projectChapters = chapters.filter(c => c.projectId === projectId);
    const dataStr = JSON.stringify(projectChapters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `zeyn-chapters-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [chapters]);

  return useMemo(() => ({
    // Data
    chapters,
    recentChapters,
    completedChapters,

    // CRUD operations
    createChapter,
    updateChapter,
    deleteChapter,
    getChapter,
    duplicateChapter,

    // Status operations
    toggleCompletion,

    // Query operations
    getChaptersByProject,
    getProjectChapterStats,

    // Document management
    addDocumentToChapter,
    removeDocumentFromChapter,
    updateChapterWordCount,

    // Organization operations
    reorderChapters,

    // Export
    exportProjectChapters,
  }), [
    chapters,
    recentChapters,
    completedChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    getChapter,
    duplicateChapter,
    toggleCompletion,
    getChaptersByProject,
    getProjectChapterStats,
    addDocumentToChapter,
    removeDocumentFromChapter,
    updateChapterWordCount,
    reorderChapters,
    exportProjectChapters,
  ]);
}
