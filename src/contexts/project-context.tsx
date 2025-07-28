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
  
  // Chapters
  chapters: Chapter[];
  getChapter: (id: string) => Chapter | undefined;
  getProjectChapters: (projectId: string) => Chapter[];
  createChapter: (input: CreateChapterInput) => Chapter;
  
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
    refreshProjectData(input.projectId);
    return newChapter;
  }, [chapters, refreshProjectData]);
  
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
    chapters: chapters.chapters,
    getChapter,
    getProjectChapters,
    createChapter,
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