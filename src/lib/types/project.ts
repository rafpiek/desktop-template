import type { TiptapValue } from '@/components/editor/v2/tiptap-types';
import { v7 as uuidv7 } from 'uuid';

// Project Status Types
export type ProjectStatus = 
  | 'draft'           // Just started, not much content
  | 'in-progress'     // Actively working on it
  | 'paused'          // Temporarily stopped
  | 'completed'       // Finished first draft
  | 'published'       // Final and published
  | 'archived';       // No longer active

// Project Label/Category Types
export type ProjectLabel = 
  | 'novel'           // Full-length novel
  | 'short-story'     // Short fiction
  | 'poetry'          // Poetry collection
  | 'essay'           // Non-fiction essay
  | 'screenplay'      // Script/screenplay
  | 'research'        // Research notes
  | 'journal'         // Personal journal
  | 'outline'         // Story outline/notes
  | 'character'       // Character development
  | 'worldbuilding';  // World/setting notes

// Project Tag Type (flexible string tags)
export interface ProjectTag {
  id: string;
  name: string;
  color?: string;     // Hex color for visual distinction
}

// Document Status Types
export type DocumentStatus = 
  | 'draft'           // Initial draft state
  | 'review'          // Under review
  | 'complete'        // Finished
  | 'archived';       // No longer active

// Document Interface
export interface Document {
  id: string;
  title: string;
  content: TiptapValue;   // TipTap editor content
  wordCount: number;  // Auto-calculated word count
  
  // Metadata
  status: DocumentStatus;
  tags: ProjectTag[];
  
  // Timestamps
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
  
  // Relationships
  projectId: string;  // Parent project ID
  chapterId?: string; // Parent chapter ID (null for drafts)
  
  // Settings
  isCompleted: boolean;
  
  // Optional metadata
  notes?: string;
}

// Chapter Interface
export interface Chapter {
  id: string;
  title: string;
  description?: string;
  
  // Metadata
  order: number;      // Chapter order in project
  isCompleted: boolean;
  
  // Timestamps
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
  
  // Relationships
  projectId: string;  // Parent project ID
  documentIds: string[]; // Document IDs in this chapter
  
  // Calculated fields (computed from documents)
  wordCount: number;  // Sum of all document word counts
}

// Core Project Interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  
  // Content
  content: TiptapValue;   // TipTap editor content
  wordCount: number;  // Auto-calculated word count
  
  // Metadata
  status: ProjectStatus;
  label: ProjectLabel;
  tags: ProjectTag[];
  
  // Timestamps
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string
  
  // Writing goals
  targetWordCount?: number;
  deadline?: string;  // ISO string
  
  // Settings
  isFavorite: boolean;
  isArchived: boolean;
  
  // Relationships
  chapterIds: string[]; // Chapter IDs in this project
  
  // Optional metadata
  genre?: string;
  notes?: string;
}

// Document Creation Input
export interface CreateDocumentInput {
  title: string;
  content?: TiptapValue;
  status?: DocumentStatus;
  tags?: ProjectTag[];
  projectId: string;
  chapterId?: string; // null for drafts
  notes?: string;
}

// Document Update Input
export interface UpdateDocumentInput {
  id: string;
  title?: string;
  content?: TiptapValue;
  status?: DocumentStatus;
  tags?: ProjectTag[];
  chapterId?: string;
  isCompleted?: boolean;
  notes?: string;
}

// Chapter Creation Input
export interface CreateChapterInput {
  title: string;
  description?: string;
  projectId: string;
  order?: number; // auto-calculated if not provided
}

// Chapter Update Input
export interface UpdateChapterInput {
  id: string;
  title?: string;
  description?: string;
  order?: number;
  isCompleted?: boolean;
}

// Project Creation Input
export interface CreateProjectInput {
  name: string;
  description?: string;
  label: ProjectLabel;
  status?: ProjectStatus;
  tags?: ProjectTag[];
  targetWordCount?: number;
  deadline?: string;
  genre?: string;
  notes?: string;
}

// Project Update Input
export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  content?: TiptapValue;
  status?: ProjectStatus;
  label?: ProjectLabel;
  tags?: ProjectTag[];
  targetWordCount?: number;
  deadline?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  genre?: string;
  notes?: string;
}

// Project Filters
export interface ProjectFilters {
  status?: ProjectStatus[];
  label?: ProjectLabel[];
  tags?: string[];      // Tag IDs
  isFavorite?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

// Project Sort Options
export type ProjectSortBy = 
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'wordCount'
  | 'status'
  | 'deadline';

export type ProjectSortOrder = 'asc' | 'desc';

export interface ProjectSort {
  by: ProjectSortBy;
  order: ProjectSortOrder;
}

// Project Statistics
export interface ProjectStats {
  totalProjects: number;
  totalWordCount: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByLabel: Record<ProjectLabel, number>;
  averageWordCount: number;
  completedProjects: number;
  inProgressProjects: number;
}

// Default values and utilities
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
  published: 'Published',
  archived: 'Archived',
};

export const PROJECT_LABEL_LABELS: Record<ProjectLabel, string> = {
  novel: 'Novel',
  'short-story': 'Short Story',
  poetry: 'Poetry',
  essay: 'Essay',
  screenplay: 'Screenplay',
  research: 'Research',
  journal: 'Journal',
  outline: 'Outline',
  character: 'Character',
  worldbuilding: 'Worldbuilding',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  review: 'Review',
  complete: 'Complete',
  archived: 'Archived',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: '#6b7280',      // gray
  'in-progress': '#3b82f6', // blue
  paused: '#f59e0b',     // amber
  completed: '#10b981',   // emerald
  published: '#8b5cf6',   // violet
  archived: '#6b7280',    // gray
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: '#f59e0b',      // amber
  review: '#3b82f6',     // blue
  complete: '#10b981',   // emerald
  archived: '#6b7280',   // gray
};

export const DEFAULT_PROJECT_TAGS: ProjectTag[] = [
  { id: '019424ec-a96a-7000-8000-000000000013', name: 'Fantasy', color: '#8b5cf6' },
  { id: '019424ec-a96a-7000-8000-000000000014', name: 'Sci-Fi', color: '#06b6d4' },
  { id: '019424ec-a96a-7000-8000-000000000015', name: 'Romance', color: '#ec4899' },
  { id: '019424ec-a96a-7000-8000-000000000016', name: 'Mystery', color: '#6366f1' },
  { id: '019424ec-a96a-7000-8000-000000000017', name: 'Horror', color: '#dc2626' },
  { id: '019424ec-a96a-7000-8000-000000000018', name: 'Historical', color: '#d97706' },
  { id: '019424ec-a96a-7000-8000-000000000019', name: 'Literary Fiction', color: '#059669' },
  { id: '019424ec-a96a-7000-8000-00000000001a', name: 'Young Adult', color: '#7c3aed' },
  { id: '019424ec-a96a-7000-8000-00000000001b', name: 'Memoir', color: '#0891b2' },
  { id: '019424ec-a96a-7000-8000-00000000001c', name: 'Biography', color: '#065f46' },
];

// Utility functions
export function createEmptyProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString();
  
  return {
    id: uuidv7(),
    name: input.name,
    description: input.description,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [] }] }, // Empty TipTap document
    wordCount: 0,
    status: input.status || 'draft',
    label: input.label,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
    targetWordCount: input.targetWordCount,
    deadline: input.deadline,
    isFavorite: false,
    isArchived: false,
    chapterIds: [],
    genre: input.genre,
    notes: input.notes,
  };
}

export function createEmptyDocument(input: CreateDocumentInput): Document {
  const now = new Date().toISOString();
  
  return {
    id: uuidv7(),
    title: input.title || '',
    content: input.content || { type: 'doc', content: [{ type: 'paragraph', content: [] }] }, // Empty TipTap document
    wordCount: 0,
    status: input.status || 'draft',
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
    projectId: input.projectId,
    chapterId: input.chapterId,
    isCompleted: false,
    notes: input.notes,
  };
}

export function createEmptyChapter(input: CreateChapterInput): Chapter {
  const now = new Date().toISOString();
  
  return {
    id: uuidv7(),
    title: input.title,
    description: input.description,
    order: input.order || 1,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
    projectId: input.projectId,
    documentIds: [],
    wordCount: 0,
  };
}

export function calculateWordCount(content: TiptapValue | unknown): number {
  // Handle TipTap content format: { type: 'doc', content: [...] }
  let contentArray: unknown[];
  
  if (content && typeof content === 'object' && 'type' in content && content.type === 'doc' && 'content' in content) {
    // TipTap format
    contentArray = Array.isArray(content.content) ? content.content : [];
  } else if (Array.isArray(content)) {
    // Plate.js format (original)
    contentArray = content;
  } else {
    // Unknown format or null/undefined
    return 0;
  }

  function extractText(node: unknown): string {
    if (typeof node === 'string') {
      return node;
    }
    
    if (!node || typeof node !== 'object') {
      return '';
    }
    
    const nodeObj = node as Record<string, unknown>;
    
    // Handle text nodes (both Plate.js and TipTap)
    if ('text' in nodeObj && typeof nodeObj.text === 'string') {
      return nodeObj.text;
    }
    
    // Handle nodes with children (Plate.js format)
    if ('children' in nodeObj && Array.isArray(nodeObj.children)) {
      return nodeObj.children.map(extractText).join(' ');
    }
    
    // Handle nodes with content (TipTap format)
    if ('content' in nodeObj && Array.isArray(nodeObj.content)) {
      return nodeObj.content.map(extractText).join(' ');
    }
    
    return '';
  }
  
  const text = contentArray.map(extractText).join(' ').trim();
  if (!text) return 0;
  
  // Count words by splitting on whitespace and filtering empty strings
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

export function generateProjectStats(projects: Project[]): ProjectStats {
  const activeProjects = projects.filter(p => !p.isArchived);
  
  const projectsByStatus = activeProjects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStatus, number>);
  
  const projectsByLabel = activeProjects.reduce((acc, project) => {
    acc[project.label] = (acc[project.label] || 0) + 1;
    return acc;
  }, {} as Record<ProjectLabel, number>);
  
  const totalWordCount = activeProjects.reduce((sum, project) => sum + project.wordCount, 0);
  
  return {
    totalProjects: activeProjects.length,
    totalWordCount,
    projectsByStatus,
    projectsByLabel,
    averageWordCount: activeProjects.length > 0 ? Math.round(totalWordCount / activeProjects.length) : 0,
    completedProjects: projectsByStatus.completed || 0,
    inProgressProjects: projectsByStatus['in-progress'] || 0,
  };
}