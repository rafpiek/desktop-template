import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Target, PlusCircle } from 'lucide-react';
import { useProjectData } from '@/hooks/use-project-data';
import { useChapters } from '@/hooks/use-chapters';
import { Button } from '@/components/ui/button';

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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Chapters</h1>
          <p className="text-muted-foreground">
            Overview of all chapters in your project
          </p>
        </div>
        <Button onClick={handleAddNewChapter}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Chapter
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {chaptersStats.map((stat) => {
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

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chaptersWithDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No chapters yet</p>
                <p className="text-sm">Create your first chapter to organize your writing</p>
              </div>
            ) : (
              chaptersWithDocuments.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/projects/${projectId}/chapters/${chapter.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{chapter.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {chapter.wordCount.toLocaleString()} words
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {chapter.documents.length} documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chapter.isCompleted 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {chapter.isCompleted ? 'Complete' : 'In Progress'}
                    </span>
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