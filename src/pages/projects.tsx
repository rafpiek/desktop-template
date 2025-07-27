import { useState } from 'react';
import { Plus, BookOpen, Target, TrendingUp, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/app-layout';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectFilters } from '@/components/projects/project-filters';
import { useProjects } from '@/hooks/use-projects';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters as Filters,
  ProjectSort,
} from '@/lib/types/project';

export default function ProjectsPage() {
  const {
    projects,
    stats,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    toggleFavorite,
    toggleArchive,
    getFilteredProjects,
  } = useProjects();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [filters, setFilters] = useState<Filters>({ isArchived: false });
  const [sort, setSort] = useState<ProjectSort>({ by: 'updatedAt', order: 'desc' });

  const filteredProjects = getFilteredProjects(filters, sort);

  const handleCreateProject = (data: CreateProjectInput) => {
    createProject(data);
  };

  const handleUpdateProject = (data: UpdateProjectInput) => {
    updateProject(data);
    setEditingProject(undefined);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(id);
    }
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects.toString(),
      icon: BookOpen,
      description: 'Active projects'
    },
    {
      title: 'Total Words',
      value: stats.totalWordCount.toLocaleString(),
      icon: Target,
      description: 'Words written'
    },
    {
      title: 'In Progress',
      value: stats.inProgressProjects.toString(),
      icon: TrendingUp,
      description: 'Currently writing'
    },
    {
      title: 'Completed',
      value: stats.completedProjects.toString(),
      icon: Archive,
      description: 'Finished drafts'
    },
  ];

  return (
    <AppLayout maxWidth="wide">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your writing projects and track your progress
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <ProjectFilters
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {projects.length === 0 
                ? 'Create your first writing project to get started.'
                : 'Try adjusting your filters or search query.'
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onDuplicate={duplicateProject}
                onToggleFavorite={toggleFavorite}
                onToggleArchive={toggleArchive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Project Dialog */}
      <ProjectFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />

      <ProjectFormDialog
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(undefined)}
        project={editingProject}
        onSubmit={handleUpdateProject}
      />
    </AppLayout>
  );
}