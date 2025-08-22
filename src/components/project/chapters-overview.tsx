import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Target, PlusCircle, Plus } from 'lucide-react';
import { useProjectData } from '@/hooks/use-project-data';
import { useChapters } from '@/hooks/use-chapters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ChaptersOverview() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCompleteProjectData, refreshProjectData } = useProjectData();
  const { createChapter } = useChapters();
  
  if (!projectId) {
    return <div>Project not found</div>;
  }

  const handleAddNewChapter = () => {
    const newChapter = createChapter({
      projectId,
      title: `New Chapter ${chaptersWithDocuments.length + 1}`,
    });
    refreshProjectData(projectId);
    navigate(`/projects/${projectId}/chapters/${newChapter.id}`);
  };

  const { chapters: chaptersWithDocuments, stats } = getCompleteProjectData(projectId);
  const totalWords = chaptersWithDocuments.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const completedChapters = chaptersWithDocuments.filter(c => c.isCompleted).length;
  const totalChapters = chaptersWithDocuments.length;

  const chaptersStats = [
    {
      title: 'Total Chapters',
      value: totalChapters.toString(),
      icon: BookOpen,
      description: 'Total chapters'
    },
    {
      title: 'Completed',
      value: `${completedChapters}/${totalChapters}`,
      icon: Target,
      description: 'Chapters completed'
    },
    {
      title: 'Total Words',
      value: totalWords.toLocaleString(),
      icon: FileText,
      description: 'Words in all chapters'
    },
    {
      title: 'Progress',
      value: `${Math.round((completedChapters / totalChapters) * 100)}%`,
      icon: Clock,
      description: 'Overall completion'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Chapters</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of all chapters in your project
          </p>
        </div>
        <Button
          onClick={handleAddNewChapter}
          className="gap-2 self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Chapter
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {chaptersStats.map((stat) => {
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

      {/* Chapters List */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            All Chapters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3">
            {chaptersWithDocuments.length === 0 ? (
              <div className="text-center py-12 px-6 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-40" />
                <p className="text-xl font-medium mb-3">No chapters yet</p>
                <p className="text-sm mb-6 text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                  Create your first chapter to organize your writing into structured sections
                </p>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Create First Chapter clicked!');
                    handleAddNewChapter();
                  }} 
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create First Chapter
                </Button>
              </div>
            ) : (
              chaptersWithDocuments.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="group relative transition-all duration-200 border-2 border-border bg-card hover:border-primary/30 hover:shadow-sm rounded-lg cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/projects/${projectId}/chapters/${chapter.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className={cn(
                            "text-lg font-semibold group-hover:text-foreground transition-colors duration-200",
                            !chapter.title && "text-muted-foreground/60 italic"
                          )}>
                            {chapter.title || 'New Chapter'}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <p className="text-sm font-medium text-muted-foreground">
                              {chapter.wordCount.toLocaleString()} words
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-muted-foreground/60" />
                            <p className="text-sm font-medium text-muted-foreground">
                              {chapter.documents.length} {chapter.documents.length === 1 ? 'document' : 'documents'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-6">
                        <span 
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                            chapter.isCompleted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {chapter.isCompleted ? '✓ Complete' : '◷ In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}