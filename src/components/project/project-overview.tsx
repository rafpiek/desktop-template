import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Clock, FileText } from 'lucide-react';
import type { Project } from '@/lib/types/project';

const mockChapters = [
  { id: '1', title: 'Chapter 1: The Beginning', wordCount: 2500, isCompleted: true },
  { id: '2', title: 'Chapter 2: Rising Action', wordCount: 3200, isCompleted: true },
  { id: '3', title: 'Chapter 3: The Discovery', wordCount: 2800, isCompleted: false },
  { id: '4', title: 'Chapter 4: Complications', wordCount: 0, isCompleted: false },
  { id: '5', title: 'Chapter 5: Climax', wordCount: 0, isCompleted: false },
  { id: '6', title: 'Chapter 6: Resolution', wordCount: 0, isCompleted: false },
];

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
        <p className="text-muted-foreground">
          Track your progress and manage your writing project
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {projectStats.map((stat) => {
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

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Word Count Progress */}
        {project.targetWordCount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Writing Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{totalWordCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      of {project.targetWordCount.toLocaleString()} words
                    </p>
                  </div>
                  <div className="text-right">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chapter Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold">{completedChapters}</p>
                  <p className="text-sm text-muted-foreground">
                    of {mockChapters.length} chapters
                  </p>
                </div>
                <div className="text-right">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Chapter 2 completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Added 500 words to Chapter 3</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Chapter 1 completed</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}