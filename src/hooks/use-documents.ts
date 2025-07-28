import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentStatus,
} from '@/lib/types/project';
import {
  createEmptyDocument,
  calculateWordCount,
} from '@/lib/types/project';

const DOCUMENTS_STORAGE_KEY = 'zeyn-documents';

export function useDocuments() {
  const [documents, setDocuments] = useLocalStorage<Document[]>(DOCUMENTS_STORAGE_KEY, []);

  // Create a new document
  const createDocument = useCallback((input: CreateDocumentInput) => {
    const newDocument = createEmptyDocument(input);
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, [setDocuments]);

  // Update an existing document
  const updateDocument = useCallback((input: UpdateDocumentInput) => {
    setDocuments(prev => prev.map(document => {
      if (document.id !== input.id) return document;

      const updatedDocument: Document = {
        ...document,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      // Recalculate word count if content was updated
      if (input.content) {
        updatedDocument.wordCount = calculateWordCount(input.content);
      }

      return updatedDocument;
    }));
  }, [setDocuments]);

  // Delete a document
  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(document => document.id !== id));
  }, [setDocuments]);

  // Toggle completion status
  const toggleCompletion = useCallback((id: string) => {
    setDocuments(prev => prev.map(document => 
      document.id === id 
        ? { ...document, isCompleted: !document.isCompleted, updatedAt: new Date().toISOString() }
        : document
    ));
  }, [setDocuments]);

  // Duplicate a document
  const duplicateDocument = useCallback((id: string) => {
    const document = documents.find(d => d.id === id);
    if (!document) return null;

    const duplicatedDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      title: `${document.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments(prev => [...prev, duplicatedDocument]);
    return duplicatedDocument;
  }, [documents, setDocuments]);

  // Get a single document by ID
  const getDocument = useCallback((id: string): Document | undefined => {
    return documents.find(document => document.id === id);
  }, [documents]);

  // Get documents by project ID
  const getDocumentsByProject = useCallback((projectId: string): Document[] => {
    return documents.filter(document => document.projectId === projectId);
  }, [documents]);

  // Get documents by chapter ID
  const getDocumentsByChapter = useCallback((chapterId: string): Document[] => {
    return documents.filter(document => document.chapterId === chapterId);
  }, [documents]);

  // Get draft documents (documents not in any chapter)
  const getDraftDocuments = useCallback((projectId: string): Document[] => {
    return documents.filter(document => 
      document.projectId === projectId && !document.chapterId
    );
  }, [documents]);

  // Get documents by status
  const getDocumentsByStatus = useCallback((status: DocumentStatus, projectId?: string): Document[] => {
    return documents.filter(document => 
      document.status === status && 
      (projectId ? document.projectId === projectId : true)
    );
  }, [documents]);

  // Move document to chapter
  const moveDocumentToChapter = useCallback((documentId: string, chapterId?: string) => {
    setDocuments(prev => prev.map(document => 
      document.id === documentId 
        ? { ...document, chapterId, updatedAt: new Date().toISOString() }
        : document
    ));
  }, [setDocuments]);

  // Get recent documents (last 5 updated)
  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [documents]);

  // Get completed documents
  const completedDocuments = useMemo(() => {
    return documents.filter(document => document.isCompleted);
  }, [documents]);

  // Get document statistics for a project
  const getProjectDocumentStats = useCallback((projectId: string) => {
    const projectDocuments = documents.filter(d => d.projectId === projectId);
    const totalWords = projectDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
    const completedCount = projectDocuments.filter(d => d.isCompleted).length;
    const draftCount = projectDocuments.filter(d => !d.chapterId).length;
    const chapterCount = projectDocuments.filter(d => d.chapterId).length;

    return {
      totalDocuments: projectDocuments.length,
      totalWords,
      completedDocuments: completedCount,
      draftDocuments: draftCount,
      chapterDocuments: chapterCount,
      averageWords: projectDocuments.length > 0 ? Math.round(totalWords / projectDocuments.length) : 0,
    };
  }, [documents]);

  // Export documents for a project
  const exportProjectDocuments = useCallback((projectId: string) => {
    const projectDocuments = documents.filter(d => d.projectId === projectId);
    const dataStr = JSON.stringify(projectDocuments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `zeyn-documents-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [documents]);

  return {
    // Data
    documents,
    recentDocuments,
    completedDocuments,

    // CRUD operations
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    duplicateDocument,

    // Status operations
    toggleCompletion,

    // Query operations
    getDocumentsByProject,
    getDocumentsByChapter,
    getDraftDocuments,
    getDocumentsByStatus,
    getProjectDocumentStats,

    // Organization operations
    moveDocumentToChapter,

    // Export
    exportProjectDocuments,
  };
}