import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Clock, FileText, Settings } from 'lucide-react';
import type { Project } from '@/lib/types/project';
import { ProjectSettingsDialog } from './project-settings-dialog';

const mockChapters = [
  { id: '019424ec-a96a-7000-8000-000000000001', title: 'Chapter 1: The Beginning', wordCount: 2500, isCompleted: true },
  { id: '019424ec-a96a-7000-8000-000000000005', title: 'Chapter 2: Rising Action', wordCount: 3200, isCompleted: true },
  { id: '019424ec-a96a-7000-8000-000000000009', title: 'Chapter 3: The Discovery', wordCount: 2800, isCompleted: false },
  { id: '019424ec-a96a-7000-8000-000000000010', title: 'Chapter 4: Complications', wordCount: 0, isCompleted: false },
  { id: '019424ec-a96a-7000-8000-000000000011', title: 'Chapter 5: Climax', wordCount: 0, isCompleted: false },
  { id: '019424ec-a96a-7000-8000-000000000012', title: 'Chapter 6: Resolution', wordCount: 0, isCompleted: false },
];

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const completedChapters = mockChapters.filter(c => c.isCompleted).length;
  const totalWordCount = mockChapters.reduce((sum, c) => sum + c.wordCount, 0);
  const estimatedDaysLeft = project.deadline 
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const projectStats = [
    {
      title: 'Total Words',
      value: totalWordCount.toLocaleString(),
      icon: FileText,
      description: 'Words written'
    },
    {
      title: 'Chapters',
      value: `${completedChapters}/${mockChapters.length}`,
      icon: BookOpen,
      description: 'Completed chapters'
    },
    {
      title: 'Progress',
      value: project.targetWordCount ? `${Math.round((totalWordCount / project.targetWordCount) * 100)}%` : 'N/A',
      icon: Target,
      description: 'Of target goal'
    },
    {
      title: 'Days Left',
      value: estimatedDaysLeft !== null ? (estimatedDaysLeft > 0 ? estimatedDaysLeft.toString() : 'Overdue') : 'No deadline',
      icon: Clock,
      description: estimatedDaysLeft !== null ? 'Until deadline' : 'Set a deadline'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Project Overview</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your progress and manage your writing project
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          className="gap-2 self-start"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Project Settings</span>
          <span className="sm:hidden">Settings</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {projectStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Word Count Progress */}
        {project.targetWordCount && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="h-5 w-5 flex-shrink-0" />
                Writing Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{totalWordCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      of {project.targetWordCount.toLocaleString()} words
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-primary">
                      {Math.round((totalWordCount / project.targetWordCount) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((totalWordCount / project.targetWordCount) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter Progress */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              Chapter Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{completedChapters}</p>
                  <p className="text-sm text-muted-foreground">
                    of {mockChapters.length} chapters
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-primary">
                    {Math.round((completedChapters / mockChapters.length) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(completedChapters / mockChapters.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-5 w-5 flex-shrink-0" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Chapter 2 completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Added 500 words to Chapter 3</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Chapter 1 completed</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectSettingsDialog
        project={project}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}