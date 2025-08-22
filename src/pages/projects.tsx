import { useState, useEffect } from 'react';
import { Plus, BookOpen, PenTool, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectFilters } from '@/components/projects/project-filters';
import { useProjects } from '@/hooks/use-projects';
import { useProjectData } from '@/hooks/use-project-data';
import { useSeeder } from '@/hooks/use-seeder';
import { useClearDemo } from '@/hooks/use-clear-demo';
import { cn } from '@/lib/utils';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters as Filters,
  ProjectSort,
} from '@/lib/types/project';
import React from 'react';

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
  
  const { recalculateChapterWordCounts } = useProjectData();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [filters, setFilters] = useState<Filters>({ isArchived: false });
  const [sort, setSort] = useState<ProjectSort>({ by: 'updatedAt', order: 'desc' });

  // Clear broken demo data first (set to true once to clear)
  useClearDemo(false);

  // Handle demo seeding - set to true to enable seeding
  const { isSeeding, seedCompleted, error: seedError } = useSeeder(true);
  
  // Recalculate word counts for all projects when the page loads
  useEffect(() => {
    projects.forEach(project => {
      recalculateChapterWordCounts(project.id);
    });
  }, [projects.length]); // Only re-run when number of projects changes

  React.useEffect(() => {
    if (seedCompleted) {
      // window.location.reload();
    }
  }, [seedCompleted]);

  const filteredProjects = getFilteredProjects(filters, sort);

  // Find the most recently updated project
  const mostRecentProject = projects.length > 0
    ? projects.reduce((latest, current) =>
        new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
      )
    : null;

  const handleCreateProject = (data: CreateProjectInput | UpdateProjectInput) => {
    createProject(data as CreateProjectInput);
  };

  const handleUpdateProject = (data: CreateProjectInput | UpdateProjectInput) => {
    updateProject(data as UpdateProjectInput);
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

  // Find the most recently updated project for quick access
  const recentProject = projects
    .filter(p => !p.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  // Smart suggestions based on user's work
  const smartActions = [];

  if (recentProject) {
    smartActions.push({
      type: 'continue',
      title: `Continue "${recentProject.name}"`,
      subtitle: `${recentProject.wordCount.toLocaleString()} words written`,
      href: `/projects/${recentProject.id}`,
      priority: true
    });
  }

  smartActions.push({
    type: 'new',
    title: 'Start New Project',
    subtitle: 'Begin your next great story',
    action: () => setIsCreateDialogOpen(true),
    priority: false
  });

  if (stats.inProgressProjects > 0) {
    smartActions.push({
      type: 'review',
      title: 'Review Drafts',
      subtitle: `${stats.inProgressProjects} projects in progress`,
      action: () => setFilters({ status: ['in-progress'] }),
      priority: false
    });
  }

  return (
    <AppLayout showNavigation={true}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative mb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            {stats.totalProjects > 0
              ? `${stats.totalWordCount.toLocaleString()} words across ${stats.totalProjects} projects`
              : 'Welcome to Zeyn'
            }
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent leading-tight">
            {stats.totalProjects > 0 ? 'Your Stories' : 'Where stories begin'}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {stats.totalProjects > 0
              ? 'Continue crafting the narratives that matter to you'
              : 'Transform ideas into compelling narratives with an editor designed for writers'
            }
          </p>
        </div>

        {/* Floating Stats Widget */}
        <div className="absolute top-0 right-0 hidden lg:block">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-border/20 rounded-2xl p-6 shadow-lg ring-1 ring-border/10">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.inProgressProjects}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Quick Actions */}
      {smartActions.length > 0 && (
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            {smartActions.map((action, index) => (
              <div
                key={index}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ring-1 ring-border/10",
                  action.priority
                    ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 flex-1"
                    : "bg-card hover:bg-muted/30 flex-1 sm:flex-none sm:w-64 border-border/20"
                )}
              >
                {action.href ? (
                  <a href={action.href} className="block p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="text-muted-foreground text-sm">{action.subtitle}</p>
                  </a>
                ) : (
                  <button
                    onClick={action.action}
                    className="w-full text-left p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="text-muted-foreground text-sm">{action.subtitle}</p>
                  </button>
                )}

                {action.priority && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search - Only show if there are projects */}
      {filteredProjects.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Projects</h2>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
          <ProjectFilters
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
          />
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            {projects.length === 0 ? (
              // First time user experience
              <div className="max-w-lg mx-auto space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-3xl"></div>
                  <PenTool className="h-24 w-24 text-muted-foreground mx-auto relative" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold">
                    Ready to write something amazing?
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Every great story starts with a single word. Let's write yours.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="gap-3 px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              // Filtered results empty state
              <div className="space-y-4">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">No projects match your filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query.
                </p>
              </div>
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
                isLastUsed={mostRecentProject?.id === project.id && !project.isArchived}
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

      {/* Seeding Loading State */}
      {isSeeding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Generating demo data...</p>
            <p className="text-sm text-muted-foreground">This will take a few seconds</p>
          </div>
        </div>
      )}

      {/* Seeding Error */}
      {seedError && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background border rounded-lg p-6 max-w-md flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Seeding Failed</p>
            <p className="text-sm text-muted-foreground text-center">{seedError}</p>
            <Button onClick={() => window.location.href = window.location.pathname}>
              Close
            </Button>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
