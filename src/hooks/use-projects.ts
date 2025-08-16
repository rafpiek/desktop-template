import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
  ProjectSort,
  ProjectStats,
  ProjectStatus,
  ProjectLabel,
} from '@/lib/types/project';
import {
  createEmptyProject,
  calculateWordCount,
  generateProjectStats,
} from '@/lib/types/project';

const PROJECTS_STORAGE_KEY = 'zeyn-projects';

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>(PROJECTS_STORAGE_KEY, []);

  // Create a new project
  const createProject = useCallback((input: CreateProjectInput) => {
    const newProject = createEmptyProject(input);
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, [setProjects]);

  // Update an existing project
  const updateProject = useCallback((input: UpdateProjectInput) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== input.id) return project;

      const updatedProject: Project = {
        ...project,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      // Recalculate word count if content was updated
      if (input.content) {
        updatedProject.wordCount = calculateWordCount(input.content);
      }

      return updatedProject;
    }));
  }, [setProjects]);

  // Delete a project
  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, [setProjects]);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    setProjects(prev => prev.map(project =>
      project.id === id
        ? { ...project, isFavorite: !project.isFavorite, updatedAt: new Date().toISOString() }
        : project
    ));
  }, [setProjects]);

  // Toggle archive status
  const toggleArchive = useCallback((id: string) => {
    setProjects(prev => prev.map(project =>
      project.id === id
        ? { ...project, isArchived: !project.isArchived, updatedAt: new Date().toISOString() }
        : project
    ));
  }, [setProjects]);

  // Duplicate a project
  const duplicateProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return null;

    const duplicatedProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };

    setProjects(prev => [...prev, duplicatedProject]);
    return duplicatedProject;
  }, [projects, setProjects]);

  // Get a single project by ID
  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  }, [projects]);

  // Filter and sort projects
  const getFilteredProjects = useCallback((
    filters?: ProjectFilters,
    sort?: ProjectSort
  ): Project[] => {
    let filtered = [...projects];

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(p => filters.status!.includes(p.status));
      }

      if (filters.label && filters.label.length > 0) {
        filtered = filtered.filter(p => filters.label!.includes(p.label));
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(p =>
          filters.tags!.some(tagId => p.tags.some(tag => tag.id === tagId))
        );
      }

      if (filters.isFavorite !== undefined) {
        filtered = filtered.filter(p => p.isFavorite === filters.isFavorite);
      }

      if (filters.isArchived !== undefined) {
        filtered = filtered.filter(p => p.isArchived === filters.isArchived);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.genre?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query) ||
          p.tags.some(tag => tag.name.toLowerCase().includes(query))
        );
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: any = a[sort.by];
        let bValue: any = b[sort.by];

        // Handle date strings
        if (sort.by === 'createdAt' || sort.by === 'updatedAt' || sort.by === 'deadline') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        // Handle undefined values
        if (aValue === undefined || aValue === null) aValue = sort.order === 'asc' ? Infinity : -Infinity;
        if (bValue === undefined || bValue === null) bValue = sort.order === 'asc' ? Infinity : -Infinity;

        if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [projects]);

  // Get recent projects (last 5 updated)
  const recentProjects = useMemo(() => {
    return getFilteredProjects(
      { isArchived: false },
      { by: 'updatedAt', order: 'desc' }
    ).slice(0, 5);
  }, [getFilteredProjects]);

  // Get favorite projects
  const favoriteProjects = useMemo(() => {
    return getFilteredProjects({ isFavorite: true, isArchived: false });
  }, [getFilteredProjects]);

  // Get projects by status
  const getProjectsByStatus = useCallback((status: ProjectStatus) => {
    return getFilteredProjects({ status: [status], isArchived: false });
  }, [getFilteredProjects]);

  // Get projects by label
  const getProjectsByLabel = useCallback((label: ProjectLabel) => {
    return getFilteredProjects({ label: [label], isArchived: false });
  }, [getFilteredProjects]);

  // Generate statistics
  const stats = useMemo((): ProjectStats => {
    return generateProjectStats(projects);
  }, [projects]);

  // Import/Export functionality
  const exportProjects = useCallback(() => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `zeyn-projects-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [projects]);

  const importProjects = useCallback((file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as Project[];

          // Validate the imported data structure
          if (!Array.isArray(imported)) {
            reject(new Error('Invalid file format: expected an array of projects'));
            return;
          }

          // Basic validation of project structure
          const isValidProject = (p: any): p is Project => {
            return p && typeof p.id === 'string' && typeof p.name === 'string';
          };

          if (!imported.every(isValidProject)) {
            reject(new Error('Invalid project data in file'));
            return;
          }

          setProjects(imported);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [setProjects]);

  return useMemo(() => ({
    // Data
    projects,
    recentProjects,
    favoriteProjects,
    stats,

    // CRUD operations
    createProject,
    updateProject,
    deleteProject,
    getProject,
    duplicateProject,

    // Status operations
    toggleFavorite,
    toggleArchive,

    // Query operations
    getFilteredProjects,
    getProjectsByStatus,
    getProjectsByLabel,

    // Import/Export
    exportProjects,
    importProjects,
  }), [
    projects,
    recentProjects,
    favoriteProjects,
    stats,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    duplicateProject,
    toggleFavorite,
    toggleArchive,
    getFilteredProjects,
    getProjectsByStatus,
    getProjectsByLabel,
    exportProjects,
    importProjects,
  ]);
}
