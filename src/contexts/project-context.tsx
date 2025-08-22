import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useProjectData } from '@/hooks/use-project-data';
import { useMockDataLoader } from '@/hooks/use-mock-data-loader';
import type { Project, Document, Chapter, CreateChapterInput } from '@/lib/types/project';

interface ProjectContextValue {
  // Projects
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  
  // Documents
  documents: Document[];
  getDocument: (id: string) => Document | undefined;
  getDraftDocuments: (projectId: string) => Document[];
  getChapterDocuments: (chapterId: string) => Document[];
  createDocumentWithUpdates: ReturnType<typeof useProjectData>['createDocumentWithUpdates'];
  updateDocument: (id: string, updates: Partial<Document>) => Document | undefined;
  deleteDocument: (documentId: string) => void;
  
  // Chapters
  chapters: Chapter[];
  getChapter: (id: string) => Chapter | undefined;
  getProjectChapters: (projectId: string) => Chapter[];
  createChapter: (input: CreateChapterInput) => Chapter;
  updateChapter: (id: string, updates: Partial<Chapter>) => Chapter | undefined;
  deleteChapter: (chapterId: string, deleteDocuments: boolean) => void;
  
  // Stats
  getProjectStats: (projectId: string) => {
    totalDocuments: number;
    totalDrafts: number;
    totalChapters: number;
    totalWords: number;
    draftWords: number;
    chapterWords: number;
  };

  // Refresh
  refreshProjectData: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  // Load mock data if needed
  useMockDataLoader();
  
  // Get all data hooks
  const { 
    projects, 
    documents, 
    chapters, 
    createDocumentWithUpdates, 
    deleteDocumentWithUpdates,
    deleteChapterWithUpdates,
    getCompleteProjectData, 
    refreshProjectData 
  } = useProjectData();
  
  const getProject = (id: string) => {
    return projects.projects.find(p => p.id === id);
  };
  
  const getDocument = (id: string) => {
    return documents.documents.find(d => d.id === id);
  };
  
  const getDraftDocuments = (projectId: string) => {
    return documents.getDraftDocuments(projectId);
  };
  
  const getChapterDocuments = (chapterId: string) => {
    return documents.documents.filter(d => d.chapterId === chapterId);
  };
  
  const getChapter = (id: string) => {
    return chapters.chapters.find(c => c.id === id);
  };
  
  const getProjectChapters = (projectId: string) => {
    return chapters.getChaptersByProject(projectId);
  };

  const createChapter = useCallback((input: CreateChapterInput) => {
    const newChapter = chapters.createChapter(input);
    return newChapter;
  }, [chapters]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    const document = documents.getDocument(id);
    if (!document) return undefined;
    
    documents.updateDocument({ id, ...updates });
    
    // Update project word count when document word count changes
    if (updates.wordCount !== undefined) {
      const allProjectDocs = documents.documents.filter(d => d.projectId === document.projectId);
      const totalWordCount = allProjectDocs.reduce((sum, doc) => {
        // Use updated word count for the current document
        return sum + (doc.id === id ? (updates.wordCount || 0) : doc.wordCount);
      }, 0);
      
      projects.updateProject({
        id: document.projectId,
        wordCount: totalWordCount
      });
    }
    
    refreshProjectData(document.projectId);
    return documents.getDocument(id);
  }, [documents, projects, refreshProjectData]);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    const chapter = chapters.getChapter(id);
    if (!chapter) return undefined;
    
    chapters.updateChapter({ id, ...updates });
    refreshProjectData(chapter.projectId);
    return chapters.getChapter(id);
  }, [chapters, refreshProjectData]);

  const deleteChapter = useCallback((chapterId: string, deleteDocuments: boolean) => {
    const chapter = chapters.getChapter(chapterId);
    if (!chapter) return;
    
    // Use the deleteChapterWithUpdates function with moveDocumentsToDrafts set to the opposite of deleteDocuments
    deleteChapterWithUpdates(chapterId, !deleteDocuments);
    refreshProjectData(chapter.projectId);
  }, [chapters, deleteChapterWithUpdates, refreshProjectData]);

  const deleteDocument = useCallback((documentId: string) => {
    const document = documents.getDocument(documentId);
    if (!document) return;
    
    deleteDocumentWithUpdates(documentId);
    
    // Update project word count after document deletion
    const remainingDocs = documents.documents.filter(d => 
      d.projectId === document.projectId && d.id !== documentId
    );
    const totalWordCount = remainingDocs.reduce((sum, doc) => sum + doc.wordCount, 0);
    
    projects.updateProject({
      id: document.projectId,
      wordCount: totalWordCount
    });
    
    refreshProjectData(document.projectId);
  }, [documents, projects, deleteDocumentWithUpdates, refreshProjectData]);
  
  const getProjectStats = (projectId: string) => {
    const data = getCompleteProjectData(projectId);
    return {
      totalDocuments: data.allDocuments.length,
      totalDrafts: data.draftDocuments.length,
      totalChapters: data.chapters.length,
      totalWords: data.stats.totalWords,
      draftWords: data.draftDocuments.reduce((sum, doc) => sum + doc.wordCount, 0),
      chapterWords: data.chapters.reduce((sum, chap) => sum + chap.wordCount, 0),
    };
  };
  
  const value: ProjectContextValue = {
    projects: projects.projects,
    getProject,
    documents: documents.documents,
    getDocument,
    getDraftDocuments,
    getChapterDocuments,
    createDocumentWithUpdates,
    updateDocument,
    deleteDocument,
    chapters: chapters.chapters,
    getChapter,
    getProjectChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    getProjectStats,
    refreshProjectData,
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}