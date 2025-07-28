import { useCallback, useState, useEffect } from 'react';
import { useProjects } from './use-projects';
import { useDocuments } from './use-documents';
import { useChapters } from './use-chapters';
import type { CreateDocumentInput, CreateChapterInput } from '@/lib/types/project';

/**
 * Combined hook that orchestrates project, document, and chapter operations
 * to maintain data consistency across all entities
 */
export function useProjectData() {
  const projects = useProjects();
  const documents = useDocuments();
  const chapters = useChapters();
  const [_, setDataVersion] = useState(0);

  const refreshProjectData = useCallback((projectId: string) => {
    setDataVersion(prev => prev + 1);
  }, []);

  // Create a document and update related entities
  const createDocumentWithUpdates = useCallback((input: CreateDocumentInput) => {
    const newDocument = documents.createDocument(input);
    
    // If document belongs to a chapter, add it to the chapter's document list
    if (input.chapterId) {
      chapters.addDocumentToChapter(input.chapterId, newDocument.id);
    }
    
    return newDocument;
  }, [documents, chapters]);

  // Delete a document and update related entities
  const deleteDocumentWithUpdates = useCallback((documentId: string) => {
    const document = documents.getDocument(documentId);
    if (!document) return;

    // Remove from chapter if it belongs to one
    if (document.chapterId) {
      chapters.removeDocumentFromChapter(document.chapterId, documentId);
    }

    // Delete the document
    documents.deleteDocument(documentId);
  }, [documents, chapters]);

  // Move document between chapters and update entities
  const moveDocumentBetweenChapters = useCallback((
    documentId: string, 
    fromChapterId: string | undefined, 
    toChapterId: string | undefined
  ) => {
    // Remove from old chapter
    if (fromChapterId) {
      chapters.removeDocumentFromChapter(fromChapterId, documentId);
    }

    // Add to new chapter
    if (toChapterId) {
      chapters.addDocumentToChapter(toChapterId, documentId);
    }

    // Update document's chapter reference
    documents.moveDocumentToChapter(documentId, toChapterId);
  }, [documents, chapters]);

  // Delete a chapter and handle its documents
  const deleteChapterWithUpdates = useCallback((chapterId: string, moveDocumentsToDrafts = true) => {
    const chapter = chapters.getChapter(chapterId);
    if (!chapter) return;

    // Handle documents in the chapter
    if (moveDocumentsToDrafts) {
      // Move all documents to drafts (remove chapter reference)
      chapter.documentIds.forEach(documentId => {
        documents.moveDocumentToChapter(documentId, undefined);
      });
    } else {
      // Delete all documents in the chapter
      chapter.documentIds.forEach(documentId => {
        documents.deleteDocument(documentId);
      });
    }

    // Delete the chapter
    chapters.deleteChapter(chapterId);
  }, [documents, chapters]);

  // Update chapter word counts based on its documents
  const recalculateChapterWordCounts = useCallback((projectId: string) => {
    const projectChapters = chapters.getChaptersByProject(projectId);
    const projectDocuments = documents.getDocumentsByProject(projectId);

    projectChapters.forEach(chapter => {
      const chapterDocuments = projectDocuments.filter(doc => doc.chapterId === chapter.id);
      const totalWordCount = chapterDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
      chapters.updateChapterWordCount(chapter.id, totalWordCount);
    });
  }, [documents, chapters]);

  // Get complete project data including chapters and documents
  const getCompleteProjectData = useCallback((projectId: string) => {
    const project = projects.getProject(projectId);
    const projectChapters = chapters.getChaptersByProject(projectId);
    const projectDocuments = documents.getDocumentsByProject(projectId);
    const draftDocuments = documents.getDraftDocuments(projectId);

    // Build chapter data with documents
    const chaptersWithDocuments = projectChapters.map(chapter => ({
      ...chapter,
      documents: projectDocuments.filter(doc => doc.chapterId === chapter.id),
    }));

    return {
      project,
      chapters: chaptersWithDocuments,
      draftDocuments,
      allDocuments: projectDocuments,
      stats: {
        ...documents.getProjectDocumentStats(projectId),
        ...chapters.getProjectChapterStats(projectId),
      },
    };
  }, [projects, documents, chapters]);

  // Initialize project with default structure
  const initializeProject = useCallback((projectId: string) => {
    // Create a default "Drafts" chapter for new documents
    const draftsChapter = chapters.createChapter({
      title: 'Drafts',
      description: 'Draft documents and ideas',
      projectId,
      order: 0, // Make it the first chapter
    });

    return draftsChapter;
  }, [chapters]);

  return {
    // Individual hooks
    projects,
    documents,
    chapters,

    // Orchestrated operations
    createDocumentWithUpdates,
    deleteDocumentWithUpdates,
    moveDocumentBetweenChapters,
    deleteChapterWithUpdates,
    recalculateChapterWordCounts,
    getCompleteProjectData,
    initializeProject,
    refreshProjectData,
  };
}